import GavelIcon from "@mui/icons-material/Gavel";
import ManageTablePage from "../components/ManageTablePage";

const ManageReglamento = () => (
  <ManageTablePage
    title="Reglamento"
    actionIcon={<GavelIcon />}
    actionTooltip="Ver reglamento"
    actionRoute="/reglamento"
  />
);

export default ManageReglamento;
