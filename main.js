let world = { width: 20, height: 15 };
world.grid = new Array(world.width * world.height).fill("empty");

world.scheme = {
	empty: "white",
	actor: "dodgerblue",
	obstacle: "gray",
	frontier: "lightgreen",
	visited: "burlywood"
};

world.cross = function(index) {
	let neighbors = [];
	if (index >= this.width)
		if (this.grid[index - this.width] != "obstacle")
			neighbors.push(index - this.width);
	if (index % this.width > 0)
		if (this.grid[index - 1] != "obstacle")
			neighbors.push(index - 1);
	if (index / this.width < this.height - 1)
		if (this.grid[index + this.width] != "obstacle")
			neighbors.push(index + this.width);
	if (index % this.width < this.width - 1)
		if (this.grid[index + 1] != "obstacle")
			neighbors.push(index + 1);
	return neighbors;
};

world.adjacent = function(index) {
	let neighbors = [];
	let x = index % this.width, y = Math.floor(index / this.width);
	for (let j = y - 1; j <= y + 1; j++) {
		for (let i = x - 1; i <= x + 1; i++) {
			if (i >= 0 && i < this.width &&
				j >= 0 && j < this.height &&
				!(i == x && j == y) &&
				this.grid[i + j * this.width] != "obstacle")
				neighbors.push(i + j * this.width);
		}
	}
	return neighbors;
};

world.createTable = function() {
	let table = document.createElement("table");
	table.style.margin = "30px auto";
	for (let y = 0; y < this.height; y++) {
		let tr = document.createElement("tr");
		for (let x = 0; x < this.width; x++) {
			let td = document.createElement("td");
			td.style.width = "40px";
			td.style.height = "40px";
			td.style.border = "1px solid #ccc";
			td.style.font = "12px monospace";
			td.style.textAlign = "center";
			td.textContent = x + y * this.width;
			let cell = this.grid[x + y * this.width];
			if (this.scheme[cell])
				td.style.backgroundColor = this.scheme[cell];
			td.onclick = event => {
				if (this.grid[x + y * this.width] == "obstacle")
					this.grid[x + y * this.width] = "empty";
				else if (this.grid[x + y * this.width] == "empty")
					this.grid[x + y * this.width] = "obstacle";
			};
			tr.appendChild(td);
		}
		table.appendChild(tr);
	}
	return table;
}

world.updateTable = function(table) {
	let tds = table.querySelectorAll("td");
	for (let i = 0; i < tds.length; i++) {
		let cell = this.grid[i];
		if (this.scheme[cell])
			tds[i].style.backgroundColor = this.scheme[cell];
	}
	return table;
}

let table = world.createTable();
document.body.appendChild(table);
(function frame() {
	requestAnimationFrame(frame);
	world.updateTable(table);
})();

let start = Math.floor(Math.random() * world.width * world.height);

let frontier = [];
let visited = {};

function inVisited(index) {
	return index in visited;
}

function inFrontier(index) {
	for (let {to} of frontier)
		if (to == index) return true;
	return false;
}

frontier.push({from: null, to: start});
world.grid[start] = "frontier";

function step() {
	let current = frontier.shift();
	if (current) {
		visited[current.to] = current.from;
		world.grid[current.to] = "visited";
		
		let td = table.querySelectorAll("td")[current.to];
		switch (current.to) {
			case (current.from - world.width):
				td.style.font = "30px monospace";
				td.textContent = "⬇";
				break;
			case (current.from - 1):
				td.style.font = "30px monospace";
				td.textContent = "➡";
				break;
			case (current.from + 1):
				td.style.font = "30px monospace";
				td.textContent = "⬅";
				break;
			case (current.from + world.width):
				td.style.font = "30px monospace";
				td.textContent = "⬆";
				break;
			default:
				td.style.font = "20px monospace";
				td.textContent = "⭕";
				break;
		}

		for (let neighbor of world.cross(current.to)) {
			if (!inFrontier(neighbor) && !inVisited(neighbor)) {
				frontier.push({from: current.to, to: neighbor});
				world.grid[neighbor] = "frontier";
			}
		}

		return true;
	} else {
		return false;
	}
}

const frameDuration = 100;
const obstacleRate = 0.3;
for (let i = 0; i < world.grid.length; i++)
	if (i != start && Math.random() < obstacleRate)
		world.grid[i] = "obstacle";
interval = setInterval(step, frameDuration);
let running = true;

let button;
button = document.createElement("button");
button.style.display = "block";
button.style.margin = "10px auto";
button.style.padding = "10px 20px";
button.style.border = "2px solid gray";
button.style.borderRadius = "50%";
button.style.backgroundColor = "beige";
button.style.color = "gray";
button.style.font = "20px monospace";
button.textContent = "STEP";
button.addEventListener("click", step);
document.body.appendChild(button);

button = document.createElement("button");
button.style.display = "block";
button.style.margin = "10px auto";
button.style.padding = "10px 20px";
button.style.border = "2px solid gray";
button.style.borderRadius = "50%";
button.style.backgroundColor = "beige";
button.style.color = "gray";
button.style.font = "20px monospace";
button.textContent = "PAUSE";
button.addEventListener("click", event => {
	if (running) {
		running = false;
		event.target.textContent = "RUN";
		clearInterval(interval);
	} else {
		running = true;
		event.target.textContent = "PAUSE";
		interval = setInterval(step, frameDuration);
	}
});
document.body.appendChild(button);