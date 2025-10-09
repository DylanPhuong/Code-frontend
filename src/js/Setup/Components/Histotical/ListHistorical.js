import { useState } from "react";
import { Button } from "@mui/material";
import ModalSearchChannels from "../../../Ultils/Modal/ModalSearchChannels";

function ListHistorical(props) {
    const [openModalSearch, setopenModalSearch] = useState(false);

    const handleOpenModalSearch = () => {
        setopenModalSearch(true)
    }

    const handleCloseModalSearch = () => {
        setopenModalSearch(false)
    }

    return (
        <div>
            <button
                className='btn btn-success '
                onClick={() => handleOpenModalSearch()}
            >
                <i className="fa fa-refresh"></i> Add
            </button>

            <ModalSearchChannels
                openModalSearch={openModalSearch}
                handleCloseModalSearch={handleCloseModalSearch} />
        </div>
    );
}

export default ListHistorical;