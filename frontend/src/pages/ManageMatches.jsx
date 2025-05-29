import { EventAvailable } from "@mui/icons-material";
import ManageTablePage from "../components/ManageTablePage";

const ManageMatches = () => (
  <ManageTablePage
    title="Programación"
    actionIcon={<EventAvailable />}
    actionTooltip="Programación"
    actionRoute="/partidos"
  />
);

export default ManageMatches;
