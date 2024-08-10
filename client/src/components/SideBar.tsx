import { useRecoilValue } from "recoil";
import InlineChat from "./InlineChat";
import SummaryCard from "./SummaryCard";
import { currentDocState } from "../atom";

const SideBar = () => {
  const content = useRecoilValue(currentDocState).content;
  const wordCount = content.split(" ").length;
  return (
    <div className="w-1/4 p-4 bg-white shadow-md overflow-y-auto">
      <SummaryCard />
      <div className="h-0.5 bg-slate-200 my-3 rounded-full w-full" />
      <InlineChat />
      <div className=" pt-6">
        <h3 className="text-lg font-semibold text-gray-800">
          Word Count: {wordCount}
        </h3>
      </div>
    </div>
  );
};

export default SideBar;
