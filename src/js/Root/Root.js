// import SideBar from '../SideBar/SideBar';
// import './Root.scss';
// // import { FaBars } from 'react-icons/fa';
// import { useState } from "react";

// const Root = (props) => {
//     const [collapsed, setCollapsed] = useState(false);

//     return (
//         <div className="admin-container">
//             {/* <div className="admin-sidebar">
//                 <SideBar collapsed={collapsed} />
//                 <FaBars onClick={() => setCollapsed(!collapsed)} /> q
//             </div>
//             <div className="admin-content">

//                 content goes here
//             </div> */}
//         </div>
//     )
// }
// export default Root;

import "./Root.scss";

/**
 * Root wrapper
 * - Không dùng Sidebar cũ nữa
 * - Chỉ bọc children để có thể tái sử dụng nếu cần
 */
const Root = ({ children }) => {
    return <div className="admin-container">{children}</div>;
};

export default Root;
