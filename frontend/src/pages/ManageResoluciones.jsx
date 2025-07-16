import AssignmentIcon from "@mui/icons-material/Assignment";
import ManageTablePage from "../components/ManageTablePage";

const ManageResoluciones = () => (
  <ManageTablePage
    title="Resoluciones"
    actionIcon={<AssignmentIcon />}
    actionTooltip="Ver resoluciones"
    actionRoute="/resoluciones"
  />
);

export default ManageResoluciones;
