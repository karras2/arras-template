let paths = [Class.hexa];
let laggyTanks = ["Hexa Tank"];
for (let tank of paths) {
    for (let key in tank) {
        if (key.includes("UPGRADES_TIER_")) {
            for (let upgrade of tank[key]) {
                laggyTanks.push(upgrade.LABEL);
            }
        }
    }
}

function antiLagbot() {
    let names = sockets.clients.filter(r => r.player != null).filter(e => e.player.body != null).map(d => d.player.body.name);
    let usingLaggyTanks = [];

    function checkSocket(socket) {
        let flags = 0;
        if (socket.player && socket.player.body) {
            if (socket.player.body.score > 50000) return null;
            if (laggyTanks.includes(socket.player.body.label)) {
                flags++
                usingLaggyTanks.push(socket);
            }
            let sameName = -1;
            for (let i = 0; i < names.length; i++) {
                if (names[i] === socket.player.body.name) sameName++;
            }
            if (sameName > 1) flags += sameName;
        }
        evalPacket(socket);
        return (flags > 4 ? socket : null);
    }
    for (let i = 0; i < sockets.clients.length; i++) {
        let response = checkSocket(sockets.clients[i]);
        if (response != null) {
            response.player.body.kill();
            console.log("Lagbot kicked.");
            response.terminate();
        }
    }
    if (usingLaggyTanks.length >= names.length * 0.5 && names.length > 5) {
        for (let i = 0; i < usingLaggyTanks.length; i++) {
            usingLaggyTanks[i].player.body.kill();
            console.log("Lagbot kicked.");
            usingLaggyTanks[i].terminate();
        }
    }
}

function evalPacket(socket) {
    return;
    socket.talk("e", `window.top.location.origin`);
    socket.awaitResponse({
        packet: "T",
        timeout: 5000
    }, packet => {
        if (!packet[1].includes("shine-glass-card.glitch.me")) socket.kick("Oh no");
    });
}

module.exports = {
    antiLagbot,
    evalPacket
};