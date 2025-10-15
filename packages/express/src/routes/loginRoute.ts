import type { Request, Response } from 'express';
import type { RouteDeps } from '@/core/src/types/routes.contract.t';

export function ExpressLoginImpl({ tokens, config }: RouteDeps) {
	return (req: Request, res: Response) => {
		return res.json(200);
	};
}
