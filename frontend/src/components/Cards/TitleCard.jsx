import Subtitle from "../Typography/Subtitle";

function TitleCard({ title, children, topMargin, TopSideButtons }) {
  return (
    <div
      className={`card w-full p-6 bg-base-100 shadow-xl ${topMargin || "mt-6"}`}
    >
      <div className="flex justify-between items-center flex-wrap gap-2">
        <Subtitle>{title}</Subtitle>
        {TopSideButtons && <div>{TopSideButtons}</div>}
      </div>
      <div className="divider mt-2" />
      <div className="h-full w-full pb-6 bg-base-100">{children}</div>
    </div>
  );
}

export default TitleCard;
