import {prisma} from "../lib/prisma.js";
export async function ownedPortfolio(userId:string,id:string){
 return prisma.portfolio.findFirst({where:{id,userId}});
}