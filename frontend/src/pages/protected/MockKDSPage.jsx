import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setPageTitle } from "../../features/common/headerSlice";
import MockKDS from "../../features/kds/MockKDS";

function MockKDSPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setPageTitle({ title: "Kitchen Display" }));
  }, []);

  return <MockKDS />;
}

export default MockKDSPage;
