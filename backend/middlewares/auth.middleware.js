import jwt from "jsonwebtoken";


export const checkAuth = async(req,res,next)=>{
   

try {
  console.log("Cookies:", req.cookies);
  const token = req.cookies?.TOKEN;

  if (!token) {
    console.log("No token found in cookies");
    return res.status(401).json({ success: false, message: "Authentication failed" });
  }

  console.log("Token received:", token);

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  console.log("Decoded payload:", decoded);

  req.user = decoded;
  next();
} catch (error) {
  console.error("AUTH MIDDLE FAILED:", error.name, error.message);
  return res.status(401).json({ msg: error.message });
}


}