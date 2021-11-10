const fs = require('fs'),
    path = require('path');


var lastTimeout = null;

module.exports = function GunJS(mod) {
    const { command } = mod;
    const { player } = mod.require.library;

    let classic_skill_ids = {};
    let autistic_skill_ids = {};
    let config_file = require('./config.json');
    //let avg_ping = (config_file['MIN_PING'] + config_file['MAX_PING']) / 2;

    if (config_file['mode'] !== "classic" && config_file['mode'] !== "autistic")
    {
        mod.settings.mode = "classic";
    }
    if (config_file['BLAST_CANCEL_DELAY'] && typeof config_file['BLAST_CANCEL_DELAY'] === "number")
    {
        classic_skill_ids['42'] = autistic_skill_ids['42'] = classic_skill_ids['1'] = autistic_skill_ids['1'] = {
            'delay': config_file['BLAST_CANCEL_DELAY']
        };
    }
    if (config_file['BOMBARDMENT_CANCEL_DELAY'] && typeof config_file['BOMBARDMENT_CANCEL_DELAY'] === "number")
    {
        autistic_skill_ids['2-1'] = {
            'delay': config_file['BOMBARDMENT_CANCEL_DELAY']
        };
    }
    if (config_file['SCATTERSHOT_CANCEL_DELAY'] && typeof config_file['SCATTERSHOT_CANCEL_DELAY'] === "number")
    {
        autistic_skill_ids['3'] = {
            'delay': config_file['SCATTERSHOT_CANCEL_DELAY']
        };
    }
    if (config_file['MANA_MISSILE_CANCEL_DELAY'] && typeof config_file['MANA_MISSILE_CANCEL_DELAY'] === "number")
    {
        classic_skill_ids['9-11'] = autistic_skill_ids['9-11'] = {
            'delay': config_file['MANA_MISSILE_CANCEL_DELAY']
        };
    }
    if (config_file['BALDER_CANCEL_DELAY'] && typeof config_file['BALDER_CANCEL_DELAY'] === "number")
    {
        autistic_skill_ids['13-2'] = autistic_skill_ids['44-2'] = {
            'delay': config_file['BALDER_CANCEL_DELAY']
        };
    }
    if (config_file['REPLENISHMENT_CANCEL_DELAY'] && typeof config_file['REPLENISHMENT_CANCEL_DELAY'] === "number")
    {
        classic_skill_ids['15'] = autistic_skill_ids['15'] = {
            'delay': config_file['REPLENISHMENT_CANCEL_DELAY']
        };
    }
    if (config_file['HB_7_CANCEL_DELAY'] && typeof config_file['HB_7_CANCEL_DELAY'] === "number")
    {
        classic_skill_ids['18'] = autistic_skill_ids['18'] = {
            'delay': config_file['HB_7_CANCEL_DELAY']
        };
    }
    if (config_file['MWS_CANCEL_DELAY'] && typeof config_file['MWS_CANCEL_DELAY'] === "number")
    {
        classic_skill_ids['41'] = autistic_skill_ids['41'] = {
            'delay': config_file['MWS_CANCEL_DELAY']
        };
    }
    if (config_file['REMOTE_TRIGGER_CANCEL_DELAY'] && typeof config_file['REMOTE_TRIGGER_CANCEL_DELAY'] === "number")
    {
        autistic_skill_ids['43-31'] = {
            'delay': config_file['REMOTE_TRIGGER_CANCEL_DELAY'],
            'fixedDelay': true
        };
    }
    if (config_file['OBLITERATION_CANCEL_DELAY'] && typeof config_file['OBLITERATION_CANCEL_DELAY'] === "number")
    {
        autistic_skill_ids['47-1'] = {
            'delay': config_file['OBLITERATION_CANCEL_DELAY']
        };
    }

    command.add('shadowgun', (arg1, val) => {
        // Check if there's an argument passed from toolbox chat
        if (!arg1)
        {
            // If there's not, then just enable / disable the mod.
            config_file['enabled'] = !config_file['enabled'];
            command.message('Shadowgun is ' + (config_file['enabled'] ? "enabled." : "disabled."));
        }
        else
        {
            // lower case everything so there won't be problem to check out what was passed on chat.
            if (typeof arg1 === "string")
            {
                arg1 = arg1.toLowerCase();
            }
            if (typeof val === "string")
            {
                val = val.toLowerCase();
            }
            // Check out combinations of possible inputs:
            switch (arg1) {
                case 'enable':
                    config_file['enabled'] = true;
                    command.message('Shadowgun is enabled.');
                    break;
                case 'disable':
                    config_file['enabled'] = false;
                    command.message('Shadowgun is disabled.');
                    break;
                case 'classic':
                case 'autistic':
                    config_file['mode'] = arg1;
                    command.message('Shadowgun is set to ' + config_file['mode'] + '.');
                    break;
                default:
                    command.message("Helper command :");
                    command.message("enable : enable the mod.");
                    command.message("disable : disable the mod.");
                    command.message("classic : a classic shadowgun for good gunner.");
                    command.message("autistic : an autistic shadowgun for autistic gunner who can't do anything without it.");
                    break;
            }
        }

    })

    mod.hook('S_ACTION_STAGE', 9, { order: -1000000, filter: {fake: true} }, event => {

        if (!config_file['enabled'] || event.gameId !== mod.game.me.gameId || mod.game.me.class !== 'engineer')
        {
            return;
        }

        const skill_id = Math.floor(event.skill.id / 10000);
        const altSkill_id = event.skill.id % 100;

        if (config_file['mode'] == "autistic")
        {
            if (skill_id in autistic_skill_ids || skill_id + '-' + altSkill_id in autistic_skill_ids) {
                const skillInfo = skill_id in autistic_skill_ids ? autistic_skill_ids[skill_id] : autistic_skill_ids[skill_id + '-' + altSkill_id];
                lastTimeout = mod.setTimeout(() => {
                    mod.toClient('S_ACTION_END', 5, {
                        gameId: event.gameId,
                        loc: {
                            x: event.loc.x,
                            y: event.loc.y,
                            z: event.loc.z
                        },
                        w: event.w,
                        templateId: event.templateId,
                        skill: event.skill.id,
                        type: 12394123,
                        id: event.id
                    });
                }, skillInfo['fixedDelay'] ? skillInfo['delay'] : skillInfo['delay'] / player['aspd']);
            }
        }
        else
        {
            if (skill_id in classic_skill_ids || skill_id + '-' + altSkill_id in classic_skill_ids) {
                const skillInfo = skill_id in classic_skill_ids ? classic_skill_ids[skill_id] : classic_skill_ids[skill_id + '-' + altSkill_id];
                lastTimeout = mod.setTimeout(() => {
                    mod.toClient('S_ACTION_END', 5, {
                        gameId: event.gameId,
                        loc: {
                            x: event.loc.x,
                            y: event.loc.y,
                            z: event.loc.z
                        },
                        w: event.w,
                        templateId: event.templateId,
                        skill: event.skill.id,
                        type: 12394123,
                        id: event.id
                    });
                }, skillInfo['fixedDelay'] ? skillInfo['delay'] : skillInfo['delay'] / player['aspd']);
            }
        }
    });
    
    mod.hook('S_ACTION_END', 5, { 'order': -1000000, 'filter': { 'fake': true } }, event => {

        if (!config_file['enabled'] || event.gameId !== mod.game.me.gameId || mod.game.me.class !== 'engineer')
        {
            return;
        }

        const skill_id = Math.floor(event.skill.id / 10000);
        const altSkill_id = event.skill.id % 100;

        if (config_file['mode'] == "autistic")
        {
            if (lastTimeout && (skill_id in autistic_skill_ids || skill_id + '-' + altSkill_id in autistic_skill_ids))
            {
                lastTimeout = null;
                if (event.type == 12394123)
                {
                    event.type = 4;
                    return true;
                }
                else {
                    return false;
                }
            }
        }
        else
        {
            if (lastTimeout && (skill_id in classic_skill_ids || skill_id + '-' + altSkill_id in classic_skill_ids))
            {
                lastTimeout = null;
                if (event.type == 12394123)
                {
                    event.type = 4;
                    return true;
                }
                else {
                    return false;
                }
            }
        }
    });

    mod.hook('C_CANCEL_SKILL', 3, event => {

        if (!config_file['enabled'] || mod.game.me.class !== 'engineer')
        {
            return;
        }

        if (lastTimeout)
        {
            mod.clearTimeout(lastTimeout);
            lastTimeout = null;
        }
    });

    mod.hook('S_EACH_SKILL_RESULT', 15, { 'order': -10000000 }, event => {

        if (!config_file['enabled'] || !lastTimeout || event.target !== mod.game.me.gameId || !event.reaction.enable)
        {
            return;
        }

        mod.clearTimeout(lastTimeout);
        lastTimeout = null;    
    });
}
