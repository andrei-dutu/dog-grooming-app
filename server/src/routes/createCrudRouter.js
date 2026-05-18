import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";

export function createCrudRouter(repository) {
  const router = Router();

  router.get(
    "/",
    asyncHandler(async (_req, res) => {
      const items = await repository.findAll();
      res.json(items.map((item) => item.toJSON()));
    }),
  );

  router.get(
    "/:id",
    asyncHandler(async (req, res) => {
      const item = await repository.findById(req.params.id);
      res.json(item.toJSON());
    }),
  );

  router.post(
    "/",
    asyncHandler(async (req, res) => {
      const item = await repository.create(req.body);
      res.status(201).json(item.toJSON());
    }),
  );

  router.put(
    "/:id",
    asyncHandler(async (req, res) => {
      const item = await repository.update(req.params.id, req.body);
      res.json(item.toJSON());
    }),
  );

  router.delete(
    "/:id",
    asyncHandler(async (req, res) => {
      const item = await repository.delete(req.params.id);
      res.json(item.toJSON());
    }),
  );

  return router;
}
