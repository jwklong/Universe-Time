var diff = 0;
var date = Date.now();
var player

tmp_update.push(_=>{
    tmp.ftGain = FUNCS.fabricTimeGain()

    tmp.inflationGain = FUNCS.inflation.gain()
    tmp.inflationEff = FUNCS.inflation.eff()

    tmp.stGain = FUNCS.stGain()
    tmp.calcUniTime = FUNCS.calcUniTime()
})

el.update.main = _=>{
    tmp.el.uni_time.setTxt(formatTime(player.uniTime))
    tmp.el.spacetimeEff.setTxt(formatTime(tmp.calcUniTime))
    tmp.el.spacetimeSoft.setHTML(tmp.stSoftcaps>0?` (softcapped${tmp.stSoftcaps>1?"<sup>"+tmp.stSoftcaps+"</sup>":""})`:"")
    tmp.el.spacetime.setTxt(format(player.spacetime,1)+" "+formatGain(player.spacetime,tmp.stGain))

    if (tmp.tab == 0) {
        if (tmp.stab[0] == 1) {
            tmp.el.inflation.setTxt(format(player.inflation,1))
            tmp.el.inflationGain.setTxt(format(tmp.inflationGain))
            tmp.el.inflationEff.setTxt(format(tmp.inflationEff))
        }
        if (tmp.stab[0] == 2) {
            tmp.el.fabricTime.setTxt(format(player.fabricTime,1)+" "+formatGain(player.fabricTime,tmp.ftGain))
        }
    }
}

const FUNCS = {
    calcUniTime() {
        let x = player.spacetime.div(1e43)
        if (hasUpg("st",5)) x = x.mul(tmp.upgs_eff.st[5])
        if (player.story > 1) x = x.mul(tmp.susy.powerEff[2])

        let p = 0.5, q = 2
        if (hasUpg("inf",2)) p = p**tmp.upgs_eff.inf[2], q = q*tmp.upgs_eff.inf[2]

        tmp.stSoftcaps = 0
        for (let i = 0; i <= 8; i++) {
            let s = 1e3**i*1e-24
            if (x.lt(s)) break
            x = x.softcap(s,p**(i*q+1),0)
            tmp.stSoftcaps++
        }
        return x
    },
    stGain() {
        let x = E(hasUpg("st",0)?1:0).mul(tmp.inflationEff)
        if (hasUpg("st",1)) x = x.mul(tmp.upgs_eff.st[1])
        if (hasUpg("st",2)) x = x.mul(20)
        if (hasUpg("inf",0)) x = x.mul(tmp.upgs_eff.inf[0])
        if (player.story > 1) x = x.mul(tmp.susy.powerEff[0])
        if (hasUpg("ft",0)) x = x.mul(tmp.upgs_eff.ft[0])
        return x
    },
    inflation: {
        gain() {
            if (player.story < 1) return E(1)
            let x = E(10)
            if (hasUpg("st",3)) x = x.add(tmp.upgs_eff.st[3])
            if (hasUpg("st",4)) x = x.add(tmp.upgs_eff.st[4])

            if (player.story > 1) x = x.pow(tmp.susy.powerEff[1])
            return x
        },
        eff() {
            let x = player.inflation.max(1).log10().add(1).pow(0.5)
            if (hasUpg("st",4)) x = x.pow(2)
            if (hasUpg("st",6)) x = x.pow(tmp.upgs_eff.st[6])
            return x
        },
    },
    fabricTimeGain() {
        if (player.uniTime.lt(1e-21)) return E(0)
        let e = player.uniTime.mul(1e21).max(1).log10()
        if (e.gte(1)) {
            if (hasUpg("st",3)) e = e.add(0.5)
        }
        let x = E(2).pow(e).sub(1)

        if (hasUpg("ft",1)) x = x.mul(tmp.upgs_eff.ft[1])
        return x
    },
}

function loop() {
    diff = Date.now()-date;
    updateTemp()
    updateHTML()
    calc(diff/1000);
    date = Date.now();
}

function format(ex, acc=4, max=9, type='sc') {
    ex = E(ex)
    neg = ex.lt(0)?"-":""
    if (ex.mag == Infinity) return neg + 'Infinity'
    if (Number.isNaN(ex.mag)) return neg + 'NaN'
    if (ex.lt(0)) ex = ex.mul(-1)
    if (ex.eq(0)) return ex.toFixed(acc)
    let e = ex.log10().floor()
    switch (type) {
        case "sc":
            if (ex.log10().lt(Math.min(-acc,0))) {
                let e = ex.log10().ceil()
                let m = ex.div(e.eq(-1)?E(0.1):E(10).pow(e))
                let be = e.mul(-1).max(1).log10().gte(9)
                return neg+(be?'':m.toFixed(4)+"×")+'10^'+(be?"(":"")+format(e, 0, max, "sc")+(be?")":"")
            } else if (e.lt(max)) {
                let a = Math.max(Math.min(acc-e.toNumber(), acc), 0)
                return neg+(a>0?ex.toFixed(a):ex.toFixed(a).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'))
            } else {
                if (ex.gte("eeee10")) {
                    let slog = ex.slog()
                    return (slog.gte(1e9)?'':E(10).pow(slog.sub(slog.floor())).toFixed(3)) + "F" + format(slog.floor(), 0)
                }
                let m = ex.div(E(10).pow(e))
                let be = e.log10().gte(9)
                return neg+(be?'':m.toFixed(4)+"×")+'10^'+(be&&e.log10().gte(max)?"(":"")+format(e, 0, max, "sc")+(be&&e.log10().gte(max)?")":"")
            }
        case "st":
            if (e.lt(3)) {
                return neg+ex.toFixed(Math.max(Math.min(acc-e.toNumber(), acc), 0))
            } else {
                if (e.gte(3e15+3)) return "e"+format(e, acc, max, "st")
                let str = e.div(3).floor().sub(1).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1 ').split(" ")
                let final = ""
                let m = ex.div(E(10).pow(e.div(3).floor().mul(3)))
                str.forEach((arr, i) => {
                    let ret = ""
                    arr.split('').forEach((v, j) => {
                        if (i == str.length - 1) ret = (Number(arr) < 3 ? ["K", "M", "B"][v] : ST_NAMES[arr.length-j-1][v]) + ret 
                        else if (Number(arr) > 1) ret = ST_NAMES[arr.length-j-1][v] + ret
                    })
                    final += (i > 0 && Number(arr) > 0 ? "-" : "") + ret + (i < str.length - 1 && Number(arr) > 0 ? ST_NAMES[3][str.length-i-1] : "")
                });
                return neg+(e.log10().gte(9)?'':(m.toFixed(E(3).sub(e.sub(e.div(3).floor().mul(3))).add(acc==0?0:1).toNumber())+" "))+final
            }
        default:
            return neg+FORMATS[type].format(ex, acc)
    }
}

function formatTime(ex) {
    ex = E(ex)
    if (ex.gte(31557600)) return format(ex.div(31557600),4,12)+" years"
    if (ex.gte(1)) return format(ex,4,12)+"s"
    if (ex.gte(1e-3)) return format(ex.mul(1e3),4,12)+"ms"
    if (ex.gte(1e-6)) return format(ex.mul(1e6),4,12)+"µs"
    if (ex.gte(1e-9)) return format(ex.mul(1e9),4,12)+"ns"
    if (ex.gte(1e-12)) return format(ex.mul(1e12),4,12)+"ps"
    if (ex.gte(1e-15)) return format(ex.mul(1e15),4,12)+"fs"
    if (ex.gte(1e-18)) return format(ex.mul(1e18),4,12)+"as"
    if (ex.gte(1e-21)) return format(ex.mul(1e21),4,12)+"zs"
    if (ex.gte(1e-24)) return format(ex.mul(1e24),4,12)+"ys"
    return format(ex.mul(1e44),4,12)+"tP"
}

function formatGain(amt, gain) {
    let f = format
	if (gain.gte(1e100) && gain.gt(amt)) return "(+"+format(gain.div(amt).max(1).log10().times(50),4)+" OoM/s)"
	else return "(+"+f(gain)+"/sec)"
}