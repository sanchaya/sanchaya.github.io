function filterList(values, typ, itemSelector) {
	document.querySelectorAll(itemSelector).forEach(e => {
		e.style.display = "none";
	});

	if (values.length === 0) {
		return;
	}

	const q = values.map(v => `${itemSelector}[data-${typ}*='${v}|']`);

	document.querySelectorAll(q.join(", ")).forEach(e => {
		e.style.display = "block";
	});
}

function onFilterClick(typ, checkboxTyp) {
	const sel = Array.from(document.querySelectorAll(`.filter-${checkboxTyp}:checked`)).map(e => e.value);
	filterList(sel, typ, "#items .item");
}

const reClean = new RegExp(/[^a-z0-9\s]+/g);
const reSpaces = new RegExp(/\s+/g);
function tokenize(str) {
	return str.toLowerCase().replace(reClean, "").replace(reSpaces, " ").split(" ").filter((c) => c !== "");
}

(function() {
	document.querySelector("#burger").onclick = (e) => {
		e.preventDefault();

		const f = document.querySelector("#sidebar");
		f.style.display = f.style.display === "block" ? "none" : "block";
	};

	let isSearching = false;
	document.querySelector("#search").oninput = function(e) {
		if (isSearching) {
			return true;
		}

		isSearching = true;
		window.setTimeout(() => {
			isSearching = false;
		}, 100);

		if (e.target.value.length < 3) {
			document.querySelectorAll("#items .item").forEach(e => e.style.display = 'block')
			return;
		}
		const search = tokenize(e.target.value);

		document.querySelectorAll("#items .item").forEach(e => {
			let txt = tokenize(e.querySelector(".title").innerText + " " + e.querySelector(".description").innerText);

			let has = 0;
			for (let i = 0; i < search.length; i++) {
				for (let j = 0; j < txt.length; j++) {
					if (txt[j].indexOf(search[i]) > -1) {
						has++;
						break;
					}
				}
			}

			e.style.display = has === search.length ? "block" : "none";
		});
	};

	document.querySelector("#toggle-filters").onclick = (e) => {
		e.preventDefault();

		const f = document.querySelector("#filters");
		f.style.display = f.style.display === "block" ? "none" : "block";
	};

	document.querySelectorAll(".toggle-filters").forEach(el => {
		el.onclick = (e) => {
			e.preventDefault();

			const typ = e.target.dataset.target;
			let selector = "";

			if (typ === "language") {
				selector = ".filter-language";
			} else if(typ === "tag") {
				selector = ".filter-tag";
			}

			document.querySelectorAll(selector).forEach(chk => {
				chk.checked = e.target.dataset.state === "on" ? false : true;
			});

			e.target.dataset.state = e.target.dataset.state === "on" ? "off" : "on";

			if (typ === "language") {
				onFilterClick("languages", "language");
			} else if (typ === "tag") {
				onFilterClick("tags", "tag");
			}
		};
	});

	document.querySelectorAll(".filter-language").forEach(el => {
		el.onchange = () => {
			onFilterClick("languages", "language");
		};
	});

	document.querySelectorAll(".filter-tag").forEach(el => {
		el.onchange = () => {
			onFilterClick("tags", "tag");
		};
	});

	document.querySelectorAll(".reveal").forEach(el => {
		el.onclick = (e) => {
			e.preventDefault();

			if (e.target.parentNode.classList.contains("visible")) {
				e.target.parentNode.classList.remove("visible");
			} else {
				e.target.parentNode.classList.add("visible");
			}
		};
	});

})();
