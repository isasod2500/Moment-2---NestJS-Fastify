
import fastify from 'fastify';
import fastifyMongodb from '@fastify/mongodb';
import fastifyStatic from '@fastify/static';
import { ObjectId, type OptionalUnlessRequiredId } from 'mongodb';
import path from 'node:path';
import 'dotenv/config';


const server = fastify({
    logger: true
});



interface Wonder {
    wonder: string;
    country: string;
    year: string;
}


interface WonderDocument extends Wonder {
    _id: ObjectId;
}

interface WonderParams {
    id: string;
}

const uri = process.env.DATABASE_URI;
if (!uri) {
    throw new Error(`Database uri not found`)
}

// Registrera MongoDB-pluginet
server.register(fastifyMongodb, {
    forceClose: true,
    url: uri,
    database: 'test'
});

// Servera HTML, CSS och JavaScript
server.register(fastifyStatic, {
    root: path.join(process.cwd(), 'public'),
    prefix: '/'
});

// Hämta collection
function getWonders() {
    return server.mongo.db!.collection<WonderDocument>('wonders');
}

// GET – Hämta alla underverk
server.get('/api/wonder', async (request, reply) => {
    try {
        const wonders = await getWonders().find({}).toArray();

        return {
            success: true,
            data: wonders
        };

    } catch (err) {
        request.log.error(err);

        return reply.code(500).send({
            success: false,
            message: 'Could not fetch wonders'
        });
    }
});

// POST – Lägg till ett nytt underverk
server.post<{ Body: Wonder }>('/api/wonder', async (request, reply) => {
    try {
        const { wonder, country, year } = request.body;

        if (
            typeof wonder !== 'string' || !wonder.trim() ||
            typeof country !== 'string' || !country.trim() ||
            typeof year !== 'string' || !year.trim()
        ) {
            return reply.code(400).send({
                success: false,
                message: 'All fields are required'
            });
        }

        const newWonder: Wonder = {
            wonder: wonder.trim(),
            country: country.trim(),
            year: year.trim()
        };

        const result = await getWonders().insertOne(
            newWonder as OptionalUnlessRequiredId<WonderDocument>
        );

        return reply.code(201).send({
            success: true,
            data: {
                _id: result.insertedId,
                ...newWonder
            }
        });

    } catch (err) {
        request.log.error(err);

        return reply.code(500).send({
            success: false,
            message: 'Could not save wonder'
        });
    }
});

// PUT – Uppdatera ett befintligt underverk
server.put<{
    Params: WonderParams;
    Body: Wonder;
}>('/api/wonder/:id', async (request, reply) => {
    try {
        const { id } = request.params;
        const { wonder, country, year } = request.body;

        if (!ObjectId.isValid(id)) {
            return reply.code(400).send({
                success: false,
                message: 'Invalid wonder ID'
            });
        }

        if (
            typeof wonder !== 'string' || !wonder.trim() ||
            typeof country !== 'string' || !country.trim() ||
            typeof year !== 'string' || !year.trim()
        ) {
            return reply.code(400).send({
                success: false,
                message: 'All fields are required'
            });
        }

        const result = await getWonders().updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    wonder: wonder.trim(),
                    country: country.trim(),
                    year: year.trim()
                }
            }
        );

        if (result.matchedCount === 0) {
            return reply.code(404).send({
                success: false,
                message: 'Wonder not found'
            });
        }

        return {
            success: true,
            message: 'Wonder updated'
        };

    } catch (err) {
        request.log.error(err);

        return reply.code(500).send({
            success: false,
            message: 'Could not update wonder'
        });
    }
});

// DELETE – Ta bort ett underverk
server.delete<{
    Params: WonderParams;
}>('/api/wonder/:id', async (request, reply) => {
    try {
        const { id } = request.params;

        if (!ObjectId.isValid(id)) {
            return reply.code(400).send({
                success: false,
                message: 'Invalid wonder ID'
            });
        }

        const result = await getWonders().deleteOne({
            _id: new ObjectId(id)
        });

        if (result.deletedCount === 0) {
            return reply.code(404).send({
                success: false,
                message: 'Wonder not found'
            });
        }

        return {
            success: true,
            message: 'Wonder deleted'
        };

    } catch (err) {
        request.log.error(err);

        return reply.code(500).send({
            success: false,
            message: 'Could not delete wonder'
        });
    }
});

// Starta servern
async function start() {
    try {
        await server.listen({ port: 8080, host: '0.0.0.0' });
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
}

server.addHook('onReady', async () => {
    const db = server.mongo.db;

    if (!db) {
        throw new Error('MongoDB database is not available');
    }

    await db.command({ ping: 1 });

    server.log.info('MongoDB connection successful!');
});

start();
