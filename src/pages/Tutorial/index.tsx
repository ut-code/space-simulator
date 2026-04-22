import { Link } from "react-router";

export default function Page() {
	return (
		<>
			<Link to="/tutorial/how-to-play" className="text-white">
				Learn how to play
			</Link>
			<Link to="/tutorial/physics" className="text-white">
				Learn physics
			</Link>
		</>
	);
}
