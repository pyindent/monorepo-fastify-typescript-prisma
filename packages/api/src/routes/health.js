export const healthRoutes = async (fastify) => {
    fastify.get('/health', async () => {
        return { status: 'ok', timestamp: new Date().toISOString() };
    });
};
