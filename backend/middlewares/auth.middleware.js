import jwt from "jsonwebtoken";
export const checkAuth = async(req,res,next)=>{
   

try {
 
  const token = req.cookies?.token;

  if (!token) {
    console.log("No token found in cookies");
    return res.status(401).json({ success: false, message: "Authentication failed" });
  }



  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  req.user = decoded;
  next();
} catch (error) {
  console.error("AUTH MIDDLE FAILED:", error.name, error.message);
  return res.status(401).json({ msg: error.message });
}


}