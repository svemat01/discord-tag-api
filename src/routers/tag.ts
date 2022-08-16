import { Router } from 'express';
import { getTag } from '../services/getTag';

export const tagRouter = Router();

tagRouter.get('/:userId', async (req, res) => {
    const {userId} = req.params;

    if (!userId.match(/\d{17,20}/)) {
        res.status(400);
        res.send('Bad userID');
        
        return;
    }

    const tag = await getTag(req.params.userId);
    res.send(tag ?? 'No user found with that ID');
});