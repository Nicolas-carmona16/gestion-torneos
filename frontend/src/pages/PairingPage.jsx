import { Handshake } from "@mui/icons-material";
import ManageTablePage from "../components/ManageTablePage";

const PairingPage = () => (
  <ManageTablePage
    title="Emparejamientos"
    actionIcon={<Handshake />}
    actionTooltip="Emparejamientos"
    actionRoute="/emparejamientos"
  />
);

export default PairingPage;
