const Rat = require('big-rational');

class MatrixRow extends Array {
	static from(arr) {
		const r = new MatrixRow();
		for(const [i, x] of arr.entries())
			r[i] = x;
		return r;
	}
	add(row) {
		return this.map((x, i) => x.add(row[i]));
	}
	neg() {
		return this.map(x => x.negate());
	}
	sub(row) {
		return this.add(row.neg());
	}
	mul(num) {
		return this.map(x => x.multiply(num));
	}
	toString() {
		return `[${this.map(x => x.toString()).join(', ')}]`;
	}
}
class Matrix extends Array {
	static from(arr) {
		const m = new Matrix();
		for(const [i, x] of arr.entries())
			m[i] = MatrixRow.from(x);
		return m;
	}
	static eye(h, w = h) {
		return Matrix.from(
			[...Array(h)].map((_, i) =>
				[...Array(w)].map((_, j) => Rat(+(i == j)))
			)
		);
	}
	static zeros(h, w) {
		return Matrix.from(
			[...Array(h)].map(() =>
				Array(w).fill(Rat.zero)
			)
		);
	}
	sub(mat) {
		for(let i = 0; i < this.length; i++)
			this[i] = this[i].sub(mat[i]);
		return this;
	}
	row_switch(i, j) {
		const t = this[i];
		this[i] = this[j];
		this[j] = t;
	}
	row_multiply(i, k) {
		this[i] = this[i].mul(k);
	}
	row_add(i, j, k) {
		this[i] = this[i].add(this[j].mul(k));
	}
	to_rref() {
		const w = this[0].length, h = this.length;
		let y = 0;
		for(let x = 0; x < w; x++) {
			let pivot_y = y + this.slice(y).findIndex(r => !r[x].isZero());
			if(pivot_y < y)
				continue;
			this.row_switch(y, pivot_y);
			this.row_multiply(y, this[y][x].reciprocate());
			for(let i = 0; i < h; i++)
				if(i != y)
					this.row_add(i, y, this[i][x].negate());
			y++;
		}
		return this;
	}
	toString() {
		return this.map(x => x.toString()).join('\n');
	}
}

const prob_table = [...Array(25)]
	.map((_, i) => [
		Math.max(1, Math.floor(i/5)),
		12 <= i && i < 17,
		Rat((x => x < 3 ? 95 - 5*x : x < 15 ? 100 - 5*x : x < 22 ? 30 : 25 - x)(i), 100),
		Rat([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 13, 14, 21, 21, 21, 28, 28, 70, 70, 194, 294, 396][i], 1000),
	])
	.map(([a, b, c, d]) => {
		const
			smp = Rat(105, 100),
			num = Rat.one.subtract(smp.multiply(c)),
			denom = Rat.one.subtract(c),
			fmp = num.divide(denom),
			success = c,
			destroy = d,
			fail = Rat.one.subtract(success).subtract(destroy),
			success_catch = success.multiply(smp),
			fail_catch = fail.multiply(fmp),
			destroy_catch = destroy.multiply(fmp);
		return {
			cost: a,
			safe_cost: b ? 5*a : undefined,
			success, fail, destroy,
			success_catch, fail_catch, destroy_catch,
			fail_safe: Rat.one.subtract(success),
			fail_safe_catch: Rat.one.subtract(success_catch),
		};
	});

const id_to_name = [], name_to_id = new Map();
'100/102/110/111/112/120/121/122/130/131/140/150/152/160/161/162/170/171/172/180/181/190/200/202/210/211/212/220/221/222/230/231/240/250'.split('/').forEach((x, i) => {
	id_to_name.push(x);
	name_to_id.set(x, i);
});
name_to_id.set('101', name_to_id.get('100'));
name_to_id.set('151', name_to_id.get('150'));
name_to_id.set('201', name_to_id.get('200'));

function transition_mat(c, s, d) {
	const mat = Matrix.zeros(34, 35);
	for(let i = 10; i < 25; i++)
		for(let j = 0; j < 3; j++) {
			const from = `${i}${j}`;
			if(name_to_id.has(from)) {
				const
					from_id = name_to_id.get(from),
					f = i%5 != 0,
					s_ = s && prob_table[i].safe_cost !== undefined;
				if(j == 2)
					mat[from_id][name_to_id.get(`${i + 1}0`)] = Rat.one;
				else {
					mat[from_id][name_to_id.get(`${i + 1}0`)] =
						c
							? prob_table[i].success_catch
							: prob_table[i].success;
					mat[from_id][name_to_id.get(f ? `${i - 1}${j + 1}` : `${i}0`)] =
						c
							? s_
								? prob_table[i].fail_safe_catch
								: prob_table[i].fail_catch
							: s_
								? prob_table[i].fail_safe
								: prob_table[i].fail;
					if(i != 11) {
						mat[from_id][name_to_id.get(`120`)] =
							s_
								? Rat.zero
							: c
								? prob_table[i].destroy_catch
								: prob_table[i].destroy;
					}
				}
				mat[from_id][34] = d
					? Rat(s ? prob_table[i].safe_cost ?? prob_table[i].cost : prob_table[i].cost).negate()
					: Rat.minusOne;
			}
		}
	return mat;
}

function rref_mat(c, s, d, r) {
	const mat = transition_mat(c, s, d).sub(eye);
	mat[indices[r + 1]] = eye[indices[r + 1]];
	return [...mat.to_rref()].map(x => x[x.length - 1]);
}

function sum(arr, from, to) {
	return arr.slice(from, to).reduce((a, b) => a.add(b));
}

function fmt(x, as_is) {
	return as_is ? x.toString() : x.valueOf().toFixed(2);
}

function emit_table(safe, frac) {
	const lut = [
		result_table[0][+safe][0],
		result_table[0][+safe][1],
		result_table[1][+safe][0],
		result_table[1][+safe][1],
	];
	console.log(`destroy protection ${safe ? 'on' : 'off'}:`);
	for(let i = 0; i < 25; i++)
		console.log(`| ${i} | ${
			lut
				.map(x => fmt(x[i], frac))
				.join(' | ')
		} |`);
	console.log();
	for(let i = 0; i < 23; i++)
		for(let j = i + 2; j <= 25; j++)
			console.log(`| ${i} -> ${j} | ${
				lut
					.map(x => fmt(sum(x, i, j), frac))
					.join(' | ')
			} |`);
	console.log();
}

const
	eye = Matrix.eye(34, 35),
	indices = [0, 2, 5, 8, 10, 11, 13, 16, 19, 21, 22, 24, 27, 30, 32, 33],
	first_ten_prob = [95, 90, 85, 85, 80, 75, 70, 65, 60, 55];

const result_table = [[[[], []], [[], []]], [[[], []], [[], []]]];

for(const hanbyeolcatch of [false, true])
	for(const safe of [false, true]) {
		const t = result_table[+hanbyeolcatch][+safe];
		for(const x of first_ten_prob.map(x => Rat(100, x)).map(x => hanbyeolcatch ? x.multiply(105, 100) : x)) {
			t[0].push(x);
			t[1].push(x);
		}
		for(let i = 0; i < indices.length - 1; i++) {
			const
				stardust = rref_mat(hanbyeolcatch, safe, true, i),
				trials = rref_mat(hanbyeolcatch, safe, false, i);
			t[0].push(trials[indices[i]]);
			t[1].push(stardust[indices[i]]);
		}
	}

emit_table(false, false);
emit_table(true, false);