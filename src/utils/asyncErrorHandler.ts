import { BadRequestError } from "./errors";

export const asyncErrorHandler = (fn: any) => {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
      if (err instanceof BadRequestError) {
        return res.status(400).json({ error: err.message });
      }

      console.error(err); // still log unexpected errors
      return res.status(500).json({ error: "Internal Server Error" });
    });
  };
};
