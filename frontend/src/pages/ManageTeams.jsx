import { Groups } from "@mui/icons-material";
import ManageTablePage from "../components/ManageTablePage";

const ManageTeams = () => (
  <ManageTablePage
    title="Equipos"
    actionIcon={<Groups />}
    actionTooltip="Equipos"
    actionRoute="/equipos"
  />
);

export default ManageTeams;
