const SUSY = {
    eff() {
        let p = E(2)
        if (hasUpg("ft",2)) p = p.add(tmp.upgs_eff.ft[2])
        let x = player.susy.particles.max(0).pow(p)
        return x
    },
    powers: {
        gain(i) {
            let x = tmp.susy.eff.root(i+1)
            return x
        },
        effect(i) {
            let x = E(1)
            let p = player.susy.powers[i]
            if (i == 0) x = p.add(1).root(3)
            if (i == 1) x = p.add(1).root(4).softcap(10,2/3,0)
            if (i == 2) x = p.add(1).root(2)
            return x
        },
    },
}

function getSusyResetGain() {
    let x = player.spacetime.div(1e9).max(0)
    if (x.lt(1)) return E(0)
    x = x.root(2)
    if (hasUpg("st",7)) x = x.mul(tmp.upgs_eff.st[7])
    return x.softcap(1e3,0.6,0).floor()
}

function susy() {
    let gain = tmp.susy.resetGain
    if (gain.gte(1)) {
        player.susy.particles = player.susy.particles.add(gain)
        player.susy.times++
        restePreSusy()
    }
}

function restePreSusy() {
    player.spacetime = E(0)
    if (hasUpg("inf",1)) player.inflation = player.inflation.root(2)
    else player.inflation = E(1)
    player.fabricTime = E(0)
    player.upgs.st = []

    for (let x = 0; x < 3; x++) player.susy.powers[x] = E(0)
}

tmp_update.push(_=>{
    tmp.susy.resetGain = getSusyResetGain()
    tmp.susy.eff = SUSY.eff()

    for (let x = 0; x < 3; x++) {
        tmp.susy.powerGain[x] = SUSY.powers.gain(x)
        tmp.susy.powerEff[x] = SUSY.powers.effect(x)
    }
})

el.update.susy = _=>{
    if (tmp.tab == 2) {
        tmp.el.rSSgain.setTxt(format(tmp.susy.resetGain,0))
        tmp.el.susyDiv.setDisplay(player.susy.times>0)
        tmp.el.susyBtn.setClasses({btn: true, full: true, locked: tmp.susy.resetGain.lt(1)})
        if (player.susy.times>0) {
            tmp.el.susyAmt.setTxt(format(player.susy.particles,0))
            tmp.el.susyEff.setTxt(format(tmp.susy.eff,0))

            for (let x = 0; x < 3; x++) {
                let unl = player.susy.times > x
                tmp.el["susyPowDiv"+x].setDisplay(unl)
                if (unl) {
                    tmp.el["susyPow"+x].setTxt(format(player.susy.powers[x],2)+" "+formatGain(player.susy.powers[x], tmp.susy.powerGain[x]))
                    tmp.el["susyPowEff"+x].setTxt(format(tmp.susy.powerEff[x],2))
                }
            }
        }
    }
}