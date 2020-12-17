const { router, text, route, line } = require("bottender/router");
const fetch = require("node-fetch");
const { withProps, Context } = require("bottender");

const BASE_URL = `https://masak-apa.tomorisakura.vercel.app`;

module.exports = async function App(context) {
	if (context.event.isText) {
		if (context.event.text.split(" ").includes("/cari")) {
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
		//text("resep", recipeDetails),\
		line.follow(handleFollow),
		text(
			"resep-nasi-goreng-jawa",
			withProps(recipeDetails, { resep: "resep-nasi-goreng-jawa" })
		),
		text(["/kategori", "Kategori"], recipeCategory),
		text("/help", handleHelp),
		line.postback(handlePostback),
		route("*", unknown),
	]);
};

async function handleFollow(context) {
	await context.sendText(
		`Hai!. Terima kasih telah follow akun ini ${String.fromCodePoint(
			0x100078
		)}. Kami menyediakan resep-resep masakan dari Indonesia. Kalian bisa cari resep berdasarkan kategori, atau berdasarkan kata kunci yang kalian inginkan (contoh: nasi goreng). Selamat memasak ${String.fromCodePoint(
			0x10008d
		)}`
	);
	await context.sendText(
		"Silahkan ketik /help untuk menampilkan perintah yang ada di bot ini"
	);
}

async function handlePostback(context) {
	try {
		if (context.event.postback.data === "pb-cari") {
			await context.sendText(
				"Silakan ketik /cari dilanjut dengan kata kunci. Contoh : /cari nasi goreng"
			);
		} else if (context.event.postback.data.split(" ").includes("kategori")) {
			let splitted = context.event.postback.data.split(" ").splice(0, 1);
			return withProps(categoryDetails, { resep: splitted[0] });
		}
		let splitted = context.event.postback.data.split(" ").splice(0, 1);
		console.log(splitted);
	} catch (err) {
		console.log(err);
	}
}

async function handleHelp(context) {
	try {
		await context.sendText(
			"Berikut perintah bot : \n/kategori = Mencari resep berdasarkan kategori yang tersedia \n/artikel = Menampilkan artikel seputar masakan \n/cari = Mencari resep berdasarkan kata kunci, contoh : /cari nasi goreng"
		);
		const quickReply = {
			items: [
				{
					type: "action",
					action: {
						type: "message",
						label: "Kategori",
						text: "/kategori",
					},
				},
				{
					type: "action",
					action: {
						type: "message",
						label: "Artikel",
						text: "/artikel",
					},
				},
				{
					type: "action",
					action: {
						type: "postback",
						label: "Cari",
						data: "pb-cari",
					},
				},
			],
		};
		await context.send([
			{
				type: "text",
				text: "Atau bisa langsung menekan tombol dibawah ini",
				quickReply,
			},
		]);
	} catch (err) {
		console.log(err);
	}
}

const recipeCategory = async (context) => {
	try {
		const quickReply = {
			items: [],
		};
		const category = await fetch(`${BASE_URL}/api/categorys/recipes/`);
		let response = await category.json();
		let data = response.results;
		data.slice(1, 6).forEach((categories) => {
			let categoryObj = {
				type: "action",
				action: {
					type: "postback",
					label: categories.category,
					data: `${categories.key} kategori`,
					//text: categories.key,
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
	} catch (err) {
		console.log(err);
	}
};

const categoryDetails = async (context, props) => {
	try {
		const contents = [];
		const details = await fetch(
			`${BASE_URL}/api/categorys/recipes/${props.resep}`
		);
		let response = await details.json();
		let data = response.results;
		data.forEach((recipe) => {
			let recipeObj = {
				type: "bubble",
				size: "kilo",
				hero: {
					type: "image",
					url: recipe.thumb,
					size: "full",
					aspectRatio: "20:13",
					aspectMode: "cover",
				},
				body: {
					type: "box",
					layout: "vertical",
					contents: [
						{
							type: "text",
							text: recipe.title,
							weight: "bold",
							size: "md",
						},
						{
							type: "box",
							layout: "vertical",
							margin: "lg",
							spacing: "sm",
							contents: [
								{
									type: "box",
									layout: "baseline",
									spacing: "sm",
									contents: [
										{
											type: "icon",
											url:
												"https://www.flaticon.com/svg/static/icons/svg/850/850960.svg",
											size: "sm",
										},
										{
											type: "text",
											text: "Waktu",
											color: "#aaaaaa",
											size: "sm",
											flex: 6,
										},
										{
											type: "text",
											text: recipe.times,
											wrap: true,
											color: "#666666",
											size: "sm",
											flex: 10,
										},
									],
								},
								{
									type: "box",
									layout: "baseline",
									spacing: "sm",
									contents: [
										{
											type: "icon",
											url:
												"https://www.flaticon.com/svg/static/icons/svg/608/608857.svg",
											size: "sm",
										},
										{
											type: "text",
											text: "Porsi",
											color: "#aaaaaa",
											size: "sm",
											flex: 6,
										},
										{
											type: "text",
											text: recipe.portion,
											wrap: true,
											color: "#666666",
											size: "sm",
											flex: 10,
										},
									],
								},
								{
									type: "box",
									layout: "baseline",
									contents: [
										{
											type: "icon",
											url:
												"https://www.flaticon.com/svg/static/icons/svg/571/571685.svg",
											size: "sm",
										},
										{
											type: "text",
											text: "Kesulitan",
											size: "sm",
											flex: 6,
											color: "#aaaaaa",
											offsetStart: "sm",
										},
										{
											type: "text",
											text: recipe.dificulty,
											wrap: true,
											color: "#666666",
											size: "sm",
											flex: 10,
											offsetStart: "sm",
										},
									],
								},
							],
						},
					],
				},
				footer: {
					type: "box",
					layout: "vertical",
					spacing: "sm",
					contents: [
						{
							type: "button",
							style: "primary",
							height: "sm",
							action: {
								type: "postback",
								label: "Lihat resep",
								data: recipe.key,
							},
						},
					],
					flex: 0,
					backgroundColor: "#81ecec",
				},
			};
			contents.push(recipeObj);
		});
		await context.sendFlex("This is a carousel flex", {
			type: "carousel",
			contents,
		});
	} catch (err) {
		console.log(err);
	}
};

const recipeDetails = async (context, props) => {
	try {
		const details = await fetch(`${BASE_URL}/api/recipe/${props.resep}`);
		let response = await details.json();
		await context.replyText(response.results.title);
	} catch (err) {
		console.log(err);
	}
};

async function unknown(context) {
	await context.sendText(
		"Mohon maaf, perintah tidak diketahui. Silakan ketik /help untuk melihat perintah bot"
	);
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
