import { Router } from 'express';
import { ApiController } from '../controllers/ApiController';

const router = Router();
const apiController = new ApiController();

/**
 * @swagger
 * /api/hello:
 *   get:
 *     summary: Message de bienvenue de l'API
 *     tags: [API]
 *     responses:
 *       200:
 *         description: Message de bienvenue
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Hello from Express backend with TypeScript!"
 */
router.get('/hello', apiController.getHello);

export default router;
