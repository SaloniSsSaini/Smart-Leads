import { Request, Response } from 'express';
import * as noteService from '../services/note.service';
import { asyncHandler } from '../utils/asyncHandler';

export const list = asyncHandler(async (req: Request, res: Response) => {
  const data = await noteService.getNotes(String(req.params.id), req.user!.orgId);
  res.json({ success: true, data });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const note = await noteService.addNote(
    String(req.params.id),
    req.user!.orgId,
    req.user!.userId,
    req.body.body
  );
  res.status(201).json({ success: true, data: note });
});
