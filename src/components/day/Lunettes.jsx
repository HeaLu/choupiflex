import { differenceInDays } from "date-fns";

const Lunettes = () => {
  const nbJour = differenceInDays(new Date(), new Date(2024, 0, 1)) % 2;
  return (
    <p style={{ textAlign: "center" }}>
      {"Aujourd'hui c'est "}
      {nbJour ? (
        <span style={{ color: "blue" }}>lunettes bleues</span>
      ) : (
        <span style={{ color: "pink" }}>lunettes roses</span>
      )}
      .
    </p>
  );
};

export default Lunettes;
