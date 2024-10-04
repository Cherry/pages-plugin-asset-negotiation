export type PluginArgs = {
	formats?: string[];
};
export default function assetNegotiationPlugin<
	Env = unknown,
	Params extends string = any,
	Data extends Record<string, unknown> = Record<string, unknown>,
>(pluginArgs: PluginArgs): PagesPluginFunction<Env, Params, Data>;
