export const homeRoutes = async (fastify) => {
    fastify.get('/', async () => {
        return { message: 'Hello from root!!!' };
    });
};
