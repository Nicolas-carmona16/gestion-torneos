import { Handshake } from "@mui/icons-material";
import ManageTablePage from "../components/ManageTablePage";

const ManagePairings = () => (
  <ManageTablePage
    title="Emparejamientos"
    actionIcon={<Handshake />}
    actionTooltip="Emparejamientos"
    actionRoute="/emparejamientos"
  />
);

export default ManagePairings;
