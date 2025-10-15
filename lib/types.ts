import { JWTPayload } from "jose";


export interface SatOpsJwtPayload extends JWTPayload {
  sub: string;
  name: string;
  email: string;
  jti: string;
  type: "User" | "GroundStation";
  role: string | string[];
  scope: string | string[];
}