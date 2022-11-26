import { authOptions } from "../auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth/next";
import Bain from "../../../src/schemas/BainSchema";
import Vitamine from "../../../src/schemas/VitamineSchema";
import Couche from "../../../src/schemas/CoucheSchema";
import Biberon from "../../../src/schemas/BiberonSchema";
import Evenement from "../../../src/schemas/EvenementSchema";
import dbConnect from "../../../src/lib/dbConnect";
import startOfDay from "date-fns/startOfDay";
import { endOfDay } from "date-fns";

async function getByDates(start, end) {
  try {
    const models = [Bain, Biberon, Vitamine, Couche, Evenement];

    let retour = [];
    for (const model of models) {
      const data = await model.find({ $gte: start, $lte: end }).lean();
      data.forEach((item) => {
        item.type = model.collection.collectionName;
      });
      retour = retour.concat(data);
    }
    return retour.sort((arr1, arr2) => arr2.date - arr1.date);
  } catch (e) {
    throw e;
  }
}

export default async function handler(req, res) {
  await dbConnect();
  const session = await unstable_getServerSession(req, res, authOptions);
  if (!session)
    res
      .status(401)
      .end("Il faut être connecté pour accéder à cette fonctionnalité");
  const { endpoint } = req.query;
  const { method, query } = req;
  switch (endpoint) {
    case "getperiod":
      if (method !== "GET") {
        res.setHeader("Allow", ["GET"]);
        return res.status(405).end(`Method ${method} Not Allowed`);
      }
      if (!query.start || !query.end)
        return res.status(400).json({ message: "Date manquante" });
      try {
        const data = await getByDates(
          new Date(query.start),
          new Date(query.end)
        );
        return res.json(data);
      } catch (err) {
        return res.status(500).json({ message: "Erreur inconnue" });
      }
    case "getdate":
      if (method !== "GET") {
        res.setHeader("Allow", ["GET"]);
        return res.status(405).end(`Method ${method} Not Allowed`);
      }
      try {
        const date = query.date ? new Date(query.date) : new Date();
        const data = await getByDates(startOfDay(date), endOfDay(date));
        return res.json(data);
      } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Erreur inconnue" });
      }
    default:
      return res.status(404).json({ message: "Cet appel n'existe pas" });
  }
}