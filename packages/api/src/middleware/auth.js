export async function authenticate(request, reply) {
    try {
        await request.jwtVerify();
    }
    catch (err) {
        reply.send(err);
    }
}
export async function authorize(request, reply) {
    const user = request.user;
    if (!user) {
        reply.code(403).send({ error: 'Unauthorized' });
    }
}
