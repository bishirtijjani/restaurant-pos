import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setPageTitle } from "../../features/common/headerSlice";
import TableManagement from "../../features/table-management";

function InternalPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setPageTitle({ title: "Table Management" }));
  }, []);

  return <TableManagement />;
}

export default InternalPage;
