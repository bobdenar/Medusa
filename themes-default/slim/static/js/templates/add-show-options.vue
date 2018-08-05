<template>
    <div id="add-show-options-content">

        <div class="field-pair alt">
            <label for="customQuality" class="clearfix">
                <span class="component-title">Preferred Quality</span>
                <span class="component-desc">
                    <quality-chooser></quality-chooser>
                </span>
            </label>
        </div>

        <!-- app.USE_SUBTITLES: -->
        <div v-if="config.subtitles.enabled" id="use-subtitles">
            <div class="field-pair">
                <label for="subtitles" class="clearfix">
                    <span class="component-title">Subtitles</span>
                    <span class="component-desc">
                            <!-- <input type="checkbox" name="subtitles" id="subtitles" ${'checked="checked"' if app.SUBTITLES_DEFAULT else ''} />-->
                        <p>Download subtitles for this show?</p>
                    </span>
                </label>
            </div>
        </div>

        <div class="field-pair">
            <label for="statusSelect">
                <span class="component-title">Status for previously aired episodes</span>
                <span class="component-desc">
                    <select name="defaultStatus" id="statusSelect" class="form-control form-control-inline input-sm">
                    <!-- for cur_status in [SKIPPED, WANTED, IGNORED]
                        <option value="${cur_status}" ${'selected="selected"' if app.STATUS_DEFAULT == cur_status else ''}>${statusStrings[cur_status]}</option>
                    -->
                    </select>
                </span>
            </label>
        </div>
        <div class="field-pair">
            <label for="statusSelectAfter">
                <span class="component-title">Status for all future episodes</span>
                <span class="component-desc">
                    <select name="defaultStatusAfter" id="statusSelectAfter" class="form-control form-control-inline input-sm">
                    <!-- for cur_status in [SKIPPED, WANTED, IGNORED]:
                        <option value="${cur_status}" ${'selected="selected"' if app.STATUS_DEFAULT_AFTER == cur_status else ''}>${statusStrings[cur_status]}</option>
                    -->
                    </select>
                </span>
            </label>
        </div>
        <div class="field-pair alt">
            <label for="season_folders" class="clearfix">
                <span class="component-title">Season Folders</span>
                <span class="component-desc">
                    <!--
                    <input type="checkbox" name="season_folders" id="season_folders" {'checked="checked"' if app.SEASON_FOLDERS_DEFAULT or app.NAMING_FORCE_FOLDERS else ''} {'disabled="disabled"' if app.NAMING_FORCE_FOLDERS else ''}/>
                    -->
                    <p>Group episodes by season folder?</p>
                </span>
            </label>
        </div>

        <!-- if enable_anime_options: -->
        <div v-if="config.default.anime" class="field-pair alt">
            <label for="anime" class="clearfix">
                <span class="component-title">Anime</span>
                <span class="component-desc">
                    <!--
                    <input type="checkbox" name="anime" id="anime" ${'checked="checked"' if app.ANIME_DEFAULT else ''} />
                    -->
                    <p>Is this show an Anime?<p>
                </span>
            </label>
        </div>

        <div class="field-pair alt">
            <label for="scene" class="clearfix">
                <span class="component-title">Scene Numbering</span>
                <span class="component-desc">
                    <!-- <input type="checkbox" name="scene" id="scene" {'checked="checked"' if app.SCENE_DEFAULT else ''} /> -->
                    <p>Is this show scene numbered?</p>
                </span>
            </label>
        </div>
        
        <div class="field-pair alt">
            <label for="saveDefaultsButton" class="nocheck clearfix">
                <span class="component-title"><input class="btn-medusa btn-inline" type="button" id="saveDefaultsButton" value="Save Defaults" disabled="disabled" /></span>
                <span class="component-desc">
                    <p>Use current values as the defaults</p>
                </span>
            </label>
        </div>

    <!--
    if enable_anime_options:
        < import medusa.black_and_white_list %>
        <include file="/inc_blackwhitelist.mako"/>
    else:
            <input type="hidden" name="anime" id="anime" value="0" />
    endif
    -->
    </div>
</template>
<script>

module.exports = {
    name: 'add-show-options',
    data() {
        return {
            enableAnimeOptions: true,
            useSubtitles: false
        }
    },
    computed: {
        header() {
            return this.$route.meta.header;
        }
    }
};
</script>
<style>
/* placeholder */
</style>
