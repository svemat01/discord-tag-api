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

    switch (tag.status) {
        case 'found':
            res.send(tag.tag);
            break;
        
        case 'not found':
            res.status(404);
            res.send('Not found');
            break;

        case 'error':
            res.status(500);
            res.send('Error');
    
        default:
            res.status(500);
            res.send('Bad Status');
            break;
    }
});