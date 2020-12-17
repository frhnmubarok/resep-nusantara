const { router, text, route, line } = require("bottender/router");
const fetch = require("node-fetch");
const { withProps, Context } = require("bottender");

const BASE_URL = `https://masak-apa.tomorisakura.vercel.app`;

module.exports = async function App(context) {
	if (context.event.isText) {
		if (context.event.text.split(" ").includes("/cari")) {
			let splitted = context.event.text.split(" ");
			splitted.shift();
			let query = splitted.join(" ");
			return withProps(searchRecipe, { resep: query });
		}
	}

	return router([
		line.follow(handleFollow),
		text(["/random", "/Random"], randomRecipe),
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
		)}. Kami menyediakan resep-resep masakan dari Indonesia. Kalian bisa cari resep berdasarkan kategori, atau berdasarkan kata kunci yang kalian inginkan (contoh: nasi goreng). Kalau kalian memilih menu Surprise Me!, kami akan mengirimkan resep masakan secara acak. Selamat memasak ${String.fromCodePoint(
			0x10008d
		)}`
	);
	await context.sendText(
		`*catatan : apabila bot tidak merespon ketika mengirimkan perintah, silahkan kirimkan perintah lagi setelah beberapa detik. Mohon maaf atas ketidaknyamanannya ${String.fromCodePoint(
			0x100092
		)}`
	);
	await context.sendText(
		"Silahkan ketik /help untuk menampilkan perintah yang ada di bot ini"
	);
	await context.sendText(
		"Informasi perintah : \n- Kategori : Bot akan menampilkan kategori masakan \n- Surprise Me! : Bot akan menampilkan resep masakan secara acak \n- Cari : cari resep berdasarkan kata kunci"
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
		} else if (context.event.postback.data.split(" ").includes("resep")) {
			let splitted = context.event.postback.data.split(" ").splice(0, 1);
			return withProps(recipeDetails, { resep: splitted[0] });
		}
		let splitted = context.event.postback.data.split(" ").splice(0, 1);
		console.log(splitted);
	} catch (err) {
		console.log(err);
	}
}

async function handleHelp(context) {
	try {
		await context.sendFlex("Menu help", {
			type: "bubble",
			size: "kilo",
			body: {
				type: "box",
				layout: "vertical",
				contents: [
					{
						type: "button",
						action: {
							type: "message",
							label: "Kategori",
							text: "/kategori",
						},
						style: "primary",
						margin: "sm",
						height: "sm",
					},
					{
						type: "button",
						action: {
							type: "message",
							label: "Surprise Me!",
							text: "/random",
						},
						style: "primary",
						margin: "sm",
						height: "sm",
					},
					{
						type: "button",
						action: {
							type: "postback",
							label: "Cari",
							data: "pb-cari",
						},
						style: "primary",
						margin: "sm",
						height: "sm",
					},
				],
				backgroundColor: "#81ecec",
			},
		});
	} catch (err) {
		console.log(err);
	}
}

const recipeCategory = async (context) => {
	try {
		const contents = [];
		const category = await fetch(`${BASE_URL}/api/categorys/recipes/`);
		let response = await category.json();
		let data = response.results;
		data.forEach((categories) => {
			let categoryObj = {
				type: "bubble",
				size: "kilo",
				body: {
					type: "box",
					layout: "vertical",
					contents: [
						{
							type: "button",
							action: {
								type: "postback",
								label: categories.category,
								data: `${categories.key} kategori`,
							},
							style: "primary",
							height: "md",
							margin: "none",
						},
					],
					backgroundColor: "#81ecec",
				},
			};
			contents.push(categoryObj);
		});

		await context.sendFlex("Menu kategori :", {
			type: "carousel",
			contents,
		});
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
							wrap: true,
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
								label: "Lihat Resep",
								data: `${recipe.key} resep`,
							},
						},
					],
					flex: 0,
					backgroundColor: "#81ecec",
				},
			};
			contents.push(recipeObj);
		});
		await context.sendFlex("Daftar resep berdasarkan kategori :", {
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
		let data = response.results;
		let bahan = [
			{
				type: "text",
				size: "md",
				margin: "sm",
				wrap: true,
				offsetTop: "sm",
				text: "Bahan-bahan",
				weight: "bold",
				decoration: "underline",
				align: "start",
				offsetBottom: "none",
				position: "relative",
				offsetEnd: "none",
				contents: [],
			},
		];
		let steps = [
			{
				type: "text",
				size: "md",
				margin: "sm",
				wrap: true,
				offsetTop: "sm",
				text: "Cara membuat",
				weight: "bold",
				decoration: "underline",
				align: "start",
				offsetBottom: "none",
				position: "relative",
				offsetEnd: "none",
				contents: [],
			},
		];

		data.ingredient.forEach((item) => {
			let ingredientObj = {
				type: "text",
				text: `- ${item}`,
				size: "sm",
				wrap: true,
				margin: "xs",
			};
			bahan.push(ingredientObj);
		});

		data.step.forEach((item) => {
			let stepObj = {
				type: "text",
				text: `${item}`,
				size: "sm",
				wrap: true,
				margin: "md",
			};
			steps.push(stepObj);
		});

		if (data.thumb === null) {
			data.thumb =
				"https://www.hopkinsmedicine.org/-/media/feature/noimageavailable.ashx";
		}

		await context.sendFlex("Detail resep :", {
			type: "bubble",
			size: "giga",
			hero: {
				type: "image",
				url: data.thumb,
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
						text: data.title,
						weight: "bold",
						size: "lg",
						align: "center",
						wrap: true,
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
										type: "text",
										text: "Waktu",
										color: "#aaaaaa",
										size: "sm",
										flex: 3,
									},
									{
										type: "text",
										text: data.times,
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
										type: "text",
										text: "Porsi",
										flex: 3,
										size: "sm",
										color: "#aaaaaa",
									},
									{
										type: "text",
										text: data.servings,
										flex: 10,
										size: "sm",
										color: "#666666",
									},
								],
							},
							{
								type: "box",
								layout: "baseline",
								contents: [
									{
										type: "text",
										text: "Kesulitan",
										flex: 3,
										size: "sm",
										color: "#aaaaaa",
									},
									{
										type: "text",
										text: data.dificulty,
										flex: 10,
										size: "sm",
										color: "#666666",
										wrap: true,
									},
								],
								spacing: "sm",
							},
							{
								type: "box",
								layout: "baseline",
								contents: [
									{
										type: "text",
										text: "Author",
										flex: 3,
										size: "sm",
										color: "#aaaaaa",
									},
									{
										type: "text",
										text: data.author.user,
										flex: 10,
										size: "sm",
										color: "#666666",
									},
								],
								spacing: "sm",
							},
						],
					},
					{
						type: "separator",
						margin: "sm",
					},
					{
						type: "box",
						layout: "vertical",
						contents: [
							{
								type: "box",
								layout: "vertical",
								contents: bahan,
							},
						],
					},
					{
						type: "separator",
						margin: "sm",
					},
					{
						type: "box",
						layout: "vertical",
						contents: [
							{
								type: "box",
								layout: "vertical",
								contents: steps,
							},
						],
					},
				],
				spacing: "none",
				margin: "none",
				borderWidth: "none",
				cornerRadius: "none",
				paddingAll: "lg",
			},
			styles: {
				footer: {
					separator: true,
				},
			},
		});
	} catch (err) {
		console.log(err);
	}
};

const searchRecipe = async (context, props) => {
	try {
		const contents = [];
		const details = await fetch(`${BASE_URL}/api/search/?q=${props.resep}`);
		let response = await details.json();
		let data = await response.results;
		if (data.length < 1)
			throw await context.sendText("Mohon maaf, kata kunci tidak ditemukan");

		data.splice(0, 8).forEach((recipe) => {
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
							wrap: true,
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
											text: recipe.serving,
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
											text: recipe.difficulty,
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
								label: "Lihat Resep",
								data: `${recipe.key} resep`,
							},
						},
					],
					flex: 0,
					backgroundColor: "#81ecec",
				},
			};
			contents.push(recipeObj);
		});
		await context.sendFlex("Detail resep :", {
			type: "carousel",
			contents,
		});
	} catch (err) {
		console.log(err);
		await context.sendText(
			"Terjadi kendala, silakan ketikkan perintah kembali"
		);
	}
};

const randomRecipe = async (context) => {
	try {
		const rand = Math.floor(Math.random() * 10);
		const randFetch = await fetch(`${BASE_URL}/api/recipes/${rand}`);
		const randResponse = await randFetch.json();
		const randData = randResponse.results[rand].key;
		const details = await fetch(`${BASE_URL}/api/recipe/${randData}`);
		let response = await details.json();
		let data = response.results;
		let bahan = [
			{
				type: "text",
				size: "md",
				margin: "sm",
				wrap: true,
				offsetTop: "sm",
				text: "Bahan-bahan",
				weight: "bold",
				decoration: "underline",
				align: "start",
				offsetBottom: "none",
				position: "relative",
				offsetEnd: "none",
				contents: [],
			},
		];
		let steps = [
			{
				type: "text",
				size: "md",
				margin: "sm",
				wrap: true,
				offsetTop: "sm",
				text: "Cara membuat",
				weight: "bold",
				decoration: "underline",
				align: "start",
				offsetBottom: "none",
				position: "relative",
				offsetEnd: "none",
				contents: [],
			},
		];

		data.ingredient.forEach((item) => {
			let ingredientObj = {
				type: "text",
				text: `- ${item}`,
				size: "sm",
				wrap: true,
				margin: "xs",
			};
			bahan.push(ingredientObj);
		});

		data.step.forEach((item) => {
			let stepObj = {
				type: "text",
				text: `${item}`,
				size: "sm",
				wrap: true,
				margin: "md",
			};
			steps.push(stepObj);
		});

		if (data.thumb === null) {
			data.thumb =
				"https://www.hopkinsmedicine.org/-/media/feature/noimageavailable.ashx";
		}

		await context.sendFlex("Detail resep :", {
			type: "bubble",
			size: "giga",
			hero: {
				type: "image",
				url: data.thumb,
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
						text: data.title,
						weight: "bold",
						size: "lg",
						align: "center",
						wrap: true,
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
										type: "text",
										text: "Waktu",
										color: "#aaaaaa",
										size: "sm",
										flex: 3,
									},
									{
										type: "text",
										text: data.times,
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
										type: "text",
										text: "Porsi",
										flex: 3,
										size: "sm",
										color: "#aaaaaa",
									},
									{
										type: "text",
										text: data.servings,
										flex: 10,
										size: "sm",
										color: "#666666",
									},
								],
							},
							{
								type: "box",
								layout: "baseline",
								contents: [
									{
										type: "text",
										text: "Kesulitan",
										flex: 3,
										size: "sm",
										color: "#aaaaaa",
									},
									{
										type: "text",
										text: data.dificulty,
										flex: 10,
										size: "sm",
										color: "#666666",
										wrap: true,
									},
								],
								spacing: "sm",
							},
							{
								type: "box",
								layout: "baseline",
								contents: [
									{
										type: "text",
										text: "Author",
										flex: 3,
										size: "sm",
										color: "#aaaaaa",
									},
									{
										type: "text",
										text: data.author.user,
										flex: 10,
										size: "sm",
										color: "#666666",
									},
								],
								spacing: "sm",
							},
						],
					},
					{
						type: "separator",
						margin: "sm",
					},
					{
						type: "box",
						layout: "vertical",
						contents: [
							{
								type: "box",
								layout: "vertical",
								contents: bahan,
							},
						],
					},
					{
						type: "separator",
						margin: "sm",
					},
					{
						type: "box",
						layout: "vertical",
						contents: [
							{
								type: "box",
								layout: "vertical",
								contents: steps,
							},
						],
					},
				],
				spacing: "none",
				margin: "none",
				borderWidth: "none",
				cornerRadius: "none",
				paddingAll: "lg",
			},
			styles: {
				footer: {
					separator: true,
				},
			},
		});
	} catch (err) {
		console.log(err);
	}
};

async function unknown(context) {
	await context.sendText(
		"Mohon maaf, perintah tidak diketahui. Silakan ketik /help untuk melihat perintah bot"
	);
}
