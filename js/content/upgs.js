const UPGS = {
    st: {
        res: "Spacetime",
        id: "st",
        canBuy(x) {
            return player.spacetime.gte(this.ctn[x].cost)
        },
        buy(x) {
            if (this.canBuy(x) && !player.upgs[this.id].includes(x)) {
                player.spacetime = player.spacetime.sub(this.ctn[x].cost)
                player.upgs[this.id].push(x)
            }
        },
        ctn: [
            {
                desc: `Start to generate spacetime each time.`,
                cost: E(0),
            },{
                desc: `Spacetime boost its gain.`,
                cost: E(15),
                effect() {
                    let x = player.spacetime.add(1).root(4).softcap(1e5,0.5,0)
                    return x
                },
                effDesc(x) { return format(x)+"x" },
            },{
                desc: `Gain 20x more Spacetime.`,
                cost: E(300),
            },{
                unl() { return player.story >= 1 },
                desc: `Spacetime adds to Inflation growth's base.`,
                cost: E(1e5),
                effect() {
                    let x = player.spacetime.add(1).log10().pow(0.75).div(2)
                    return x
                },
                effDesc(x) { return "+"+format(x)+"x" },
            },{
                unl() { return player.story >= 1 },
                desc: `Inflation adds its base at a reduced rate. The inflation effect is raised by 2`,
                cost: E(1e6),
                effect() {
                    let x = player.inflation.add(1).log10().pow(2/3).div(20)
                    return x
                },
                effDesc(x) { return "+"+format(x)+"x" },
            },{
                unl() { return player.story >= 1 },
                desc: `Universe time formula is multiplied by spacetime.`,
                cost: E(1e8),
                effect() {
                    let x = player.spacetime.add(1).log10().add(1).pow(2)
                    return x
                },
                effDesc(x) { return format(x)+"x" },
            },{
                unl() { return player.story >= 2 && player.susy.times > 1 },
                desc: `Raise Inflation's effect based on Slepton.`,
                cost: E(1e11),
                effect() {
                    let x = player.susy.powers[1].add(1).log10().add(1).root(6)
                    return x
                },
                effDesc(x) { return "^"+format(x) },
            },{
                unl() { return player.story >= 2 && player.susy.times > 2 },
                desc: `Universe time boost Supersymmetry particles gain.`,
                cost: E(1e16),
                effect() {
                    let x = player.uniTime.mul(1e44).add(1).log10().root(1.5)
                    return x
                },
                effDesc(x) { return format(x)+"x" },
            },
        ],
    },
    inf: {
        res: "Inflation",
        id: "inf",
        canBuy(x) {
            return player.inflation.gte(this.ctn[x].cost)
        },
        buy(x) {
            if (this.canBuy(x) && !player.upgs[this.id].includes(x)) {
                player.inflation = player.inflation.div(this.ctn[x].cost)
                player.upgs[this.id].push(x)
            }
        },
        ctn: [
            {
                unl() { return player.susy.times > 1 },
                desc: `Universe time boost spacetime gain at a reduced rate.`,
                cost: E("e3600"),
                effect() {
                    let x = player.uniTime.mul(1e44).add(1).log10().add(1).pow(1.25)
                    return x
                },
                effDesc(x) { return format(x)+"x" },
            },{
                unl() { return player.susy.times > 1 },
                desc: `Keep ^0.5 of Inflation gained on reset.`,
                cost: E("e7200"),
            },{
                unl() { return player.susy.times > 1 },
                desc: `Universe time's formula softcap is weaker based on Inflation.`,
                cost: E("e1e7"),
                effect() {
                    let x = E(0.9).pow(player.inflation.log10().add(1).log10().root(2)).toNumber();
                    return x
                },
                effDesc(x) { return format((1-x)*100)+"% weaker" },
            },
        ],
    },
    ft: {
        res: "Fabric of time",
        id: "ft",
        canBuy(x) {
            return player.fabricTime.gte(this.ctn[x].cost)
        },
        buy(x) {
            if (this.canBuy(x) && !player.upgs[this.id].includes(x)) {
                player.fabricTime = player.fabricTime.sub(this.ctn[x].cost)
                player.upgs[this.id].push(x)
            }
        },
        ctn: [
            {
                desc: `Gain more spacetime based on the fabric of time.`,
                cost: E(50),
                effect() {
                    let x = player.fabricTime.add(1).pow(0.75)
                    return x
                },
                effDesc(x) { return format(x)+"x" },
            },{
                desc: `Gain more fabric of time based on supersymmetry particles.`,
                cost: E(100),
                effect() {
                    let x = player.susy.particles.add(1).log10().add(1).pow(1.5)
                    return x
                },
                effDesc(x) { return format(x)+"x" },
            },{
                desc: `Supersymmetry's effect exponent is increased based on the fabric of time.`,
                cost: E(1000),
                effect() {
                    let x = player.fabricTime.add(1).log10().root(3)
                    return x
                },
                effDesc(x) { return "^2 → ^"+format(x.add(2)) },
            },{
                unl() { return player.susy.times > 0 },
                desc: `Gain 10% of Supersymmetry particles gained on reset.`,
                cost: E(10000),
            },
        ],
    },
    /*
    inf: {
        res: "Inflation",
        id: "inf",
        canBuy(x) {
            return player.inflation.gte(this.ctn[x].cost)
        },
        buy(x) {
            if (this.canBuy(x) && !player.upgs[this.id].includes(x)) {
                player.inflation = player.inflation.sub(this.ctn[x].cost)
                player.upgs[this.id].push(x)
            }
        },
        ctn: [

        ],
    },
    /*
    {
        desc: `Placeholder.`,
        cost: E(1/0),
        effect() {
            let x = E(1)
            return x
        },
        effDesc(x) { return format(x)+"x" },
    },
    */
}

function hasUpg(x,c) { return player.upgs[x].includes(c) }

function updateUpgsHTML(x) {
    let us = UPGS[x]
    for (let c = 0; c < us.ctn.length; c++) {
        let u = us.ctn[c]
        let unl = u.unl?u.unl():true
        let id = `upg_${x}_${c}`

        tmp.el[id+"_div"].setDisplay(unl)
        if (unl) {
            tmp.el[id+"_div"].setClasses({upg_btn: true, locked: !us.canBuy(c) && !player.upgs[x].includes(c), bought: player.upgs[x].includes(c)})
            tmp.el[id+"_cost"].setTxt(format(u.cost,0))
            if (u.effDesc) tmp.el[id+"_eff"].setHTML(u.effDesc(tmp.upgs_eff[x][c]))
        }
    }
}

el.update.upgs = _=>{
    if (tmp.tab == 0) {
        if (tmp.stab[0] == 0) updateUpgsHTML("st")
        if (tmp.stab[0] == 1) updateUpgsHTML("inf")
        if (tmp.stab[0] == 2) updateUpgsHTML("ft")
    }
}

el.setup.upgs = _=>{
    for (let x in UPGS) {
        let table = new Element('upgs_'+x+"_table")
        if (table.el) {
            let us = UPGS[x]
            let inner = ""
            for (let c = 0; c < us.ctn.length; c++) {
                let u = us.ctn[c]
                let id = `upg_${x}_${c}`
                inner += `
                <button class="upg_btn" id="${id}_div" onclick="UPGS.${x}.buy(${c})">
                    ${u.desc}<br>
                    ${u.effDesc?`Currently: <span id="${id}_eff">???</span><br>`:""}
                    Cost: <span id="${id}_cost">???</span> ${us.res}
                </button>
                `
            }
            table.setHTML(inner)
        }
    }
}

tmp_update.push(_=>{
    for (let x in UPGS) {
        let us = UPGS[x]
        for (let c = 0; c < us.ctn.length; c++) {
            let u = us.ctn[c]
            if (u.effect) tmp.upgs_eff[x][c] = u.effect()
        }
    }
})