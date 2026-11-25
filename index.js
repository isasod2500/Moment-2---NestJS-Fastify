import fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import path from 'node:path';
const server = fastify();
server.register(fastifyStatic, {
    root: path.join(process.cwd(), 'public'),
    prefix: '/'
});
server.listen({ port: 8080 }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server listening at ${address}`);
});
async function launch() {
    await server.register(fastifyMongodb, {
        forceClose: true,
        url: 'mongodb://localhost:27017/mydb'
    });
    await server.ready();
    const wonders = server.mongo.db?.collection('wonders');
    const allWonders = await wonders?.find({}).toArray();
    if (!wonders) {
        console.error(`Database not found`);
    }
    console.log(allWonders);
    // Registrera route
    server.get('/auth', {
        preValidation: async (request, reply) => {
            const { username } = request.query;
            if (username !== 'admin') {
                return reply.code(401).send({
                    error: 'Must be admin!'
                });
            }
        }
    }, async (request, reply) => {
        const customerHeader = request.headers['h-custom'];
        return { success: true };
    });
    // Starta servern
    await server.listen({ port: 8080 });
}
launch().catch(err => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map