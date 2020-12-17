const { router, text, route, line } = require("bottender/router");
const fetch = require("node-fetch");
const { withProps, Context } = require("bottender");

module.exports = async function App(context) {
	if (context.event.isText) {
		if (context.event.text.split("").includes("/")) {
			await context.sendText(`OK`);
		}
	}
	// if (context.event.isPayload) {
	// 	//context.payload("apakah kamu eeq");
	// 	if (context.event.payload === "sd") {
	// 		context.payload("asd");
	// 	}
	// 	await context.sendText(`received the payload: ${context.event.payload}`);
	// }
	return router([
		text("resep", sayHello),
		text(
			"resep-nasi-goreng-jawa",
			withProps(recipeDetails, { resep: "resep-nasi-goreng-jawa" })
		),
		text("kategori", recipeCategory),
		line.postback(HandlePostback),
		route("*", Unknown),
	]);
};

async function HandlePostback(context) {
	console.log(context.event.postback);
}

const recipeCategory = async (context) => {
	const quickReply = {
		items: [],
	};
	const category = await fetch(
		`https://masak-apa.tomorisakura.vercel.app/api/categorys/recipes/`
	);
	let response = await category.json();
	let data = response.results;
	data.slice(1, 6).forEach((categories) => {
		let categoryObj = {
			type: "action",
			action: {
				type: "postback",
				label: categories.category,
				data: categories.key,
			},
		};
		quickReply.items.push(categoryObj);
	});

	await context.send([
		{
			type: "text",
			text: "Berikut kategori masakan",
			quickReply,
		},
	]);
};

const recipeDetails = async (context, props) => {
	try {
		const details = await fetch(
			`https://masak-apa.tomorisakura.vercel.app/api/recipe/${props.resep}`
		);
		let response = await details.json();
		await context.replyText(response.results.title);
	} catch (err) {
		console.log(err);
	}
};

async function Unknown(context) {
	await context.sendText(context.event.text);
}

// const weather = (context) => {
// 	fetch(
// 		"https://api.openweathermap.org/data/2.5/weather?q=mumbai&units=metric&APPID=fd00acb497f50e8a216830219f3b24c4"
// 	)
// 		.then((response) => response.json())
// 		.then((data) => context.replyText(data.main.feels_like))
// 		.catch((err) => console.log(err));
// };

async function getWeather() {
	const weather = await fetch(
		"https://api.openweathermap.org/data/2.5/weather?q=mumbai&units=metric&APPID=fd00acb497f50e8a216830219f3b24c4"
	);
	let response = await weather.json();
	console.log(response.main.feels_like);
}
