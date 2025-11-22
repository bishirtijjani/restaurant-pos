import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setPageTitle } from "../../features/common/headerSlice";
import AddOnGroupsManagement from "../../features/addOnGroups";

function InternalPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setPageTitle({ title: "Add On Management" }));
  }, []);

  return <AddOnGroupsManagement />;
}

export default InternalPage;
