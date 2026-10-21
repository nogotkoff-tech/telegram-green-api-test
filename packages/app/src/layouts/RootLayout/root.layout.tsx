import { Outlet } from "react-router-dom";

export default () => {
	return (
		<main style={{ backgroundColor: "gray" }}>
			<Outlet />
		</main>
	);
};
