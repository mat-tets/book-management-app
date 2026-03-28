import { useContext } from "react";

import ConfirmContext from "../context/ConfirmContext";

const useConfirm = () => useContext(ConfirmContext);

export default useConfirm;
