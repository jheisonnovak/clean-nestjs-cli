import { plural } from "pluralize";

type RouteDefinition = {
	method: "Get" | "Post" | "Patch" | "Delete";
	path?: string | undefined;
};

export function getRouteFromAction(action: string): RouteDefinition {
	const words = action.replace("-one", "").replace("-by-id", "").split("-");
	const resource = words.slice(1).join("-");
	const verb = words[0];
	const pluralizedPath = resource ? plural(resource) : "";
	switch (verb) {
		case "find":
		case "list":
		case "get":
			return { method: "Get", path: pluralizedPath };

		case "create":
		case "add":
			return { method: "Post", path: pluralizedPath };

		case "update":
			return { method: "Patch", path: pluralizedPath ? `${pluralizedPath}/:id` : ":id" };

		case "delete":
		case "remove":
			return { method: "Delete", path: pluralizedPath ? `${pluralizedPath}/:id` : ":id" };

		default:
			return { method: "Get", path: `${action}` };
	}
}
