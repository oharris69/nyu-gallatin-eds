import fs from 'node:fs';

const CONF = '/conf/nyu-gallatin-eds';

// Field builders that mirror the WORKING Spring Green CTA structure.
let order = 0;
const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function textSingle(node, name, label, { required = false } = {}) {
  order += 1;
  return `        <${node} jcr:primaryType="nt:unstructured"
          sling:resourceType="granite/ui/components/coral/foundation/form/textfield"
          fieldLabel="${esc(label)}" name="${name}" valueType="string" metaType="text-single"
          listOrder="${order}" maxlength="255" showEmptyInReadOnly="true" renderReadOnly="false"${required ? ' required="on"' : ''}/>`;
}
function multiValue(node, name, label) {
  order += 1;
  // multi-value string: textfield + multiple, valueType string[]
  return `        <${node} jcr:primaryType="nt:unstructured"
          sling:resourceType="granite/ui/components/coral/foundation/form/textfield"
          fieldLabel="${esc(label)}" name="${name}" valueType="string[]" metaType="text-single"
          listOrder="${order}" multiple="{Boolean}true" showEmptyInReadOnly="true" renderReadOnly="false"/>`;
}
function textMulti(node, name, label) {
  order += 1;
  return `        <${node} jcr:primaryType="nt:unstructured"
          sling:resourceType="dam/cfm/admin/components/authoring/contenteditor/multieditor"
          fieldLabel="${esc(label)}" name="${name}" valueType="string/multiline" metaType="text-multi"
          listOrder="${order}" cfm-element="${esc(label)}" default-mime-type="text/plain" showEmptyInReadOnly="true" renderReadOnly="false"/>`;
}
function richText(node, name, label) {
  order += 1;
  return `        <${node} jcr:primaryType="nt:unstructured"
          sling:resourceType="dam/cfm/admin/components/authoring/contenteditor/multieditor"
          fieldLabel="${esc(label)}" name="${name}" valueType="string/multiline" metaType="text-multi"
          listOrder="${order}" cfm-element="${esc(label)}" default-mime-type="text/html" showEmptyInReadOnly="true" renderReadOnly="false"/>`;
}
function imageRef(node, name, label) {
  order += 1;
  return `        <${node} jcr:primaryType="nt:unstructured"
          sling:resourceType="dam/cfm/models/editor/components/contentreference"
          fieldLabel="${esc(label)}" name="${name}" valueType="string/reference" metaType="reference"
          listOrder="${order}" filter="hierarchy" nameSuffix="contentReference" rootPath="/content/dam" showThumbnail="true" showEmptyInReadOnly="true" renderReadOnly="false"/>`;
}

function model(modelName, title, description, fieldsXml) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<jcr:root xmlns:jcr="http://www.jcp.org/jcr/1.0" xmlns:nt="http://www.jcp.org/jcr/nt/1.0"
    xmlns:cq="http://www.day.com/jcr/cq/1.0" xmlns:sling="http://sling.apache.org/jcr/sling/1.0"
    jcr:primaryType="cq:Template"
    ranking="{Long}100"
    allowedPaths="[/content/dam/nyu-gallatin-eds(/.*)?]">
    <jcr:content
        jcr:primaryType="cq:PageContent"
        jcr:title="${esc(title)}"
        jcr:description="${esc(description)}"
        sling:resourceType="dam/cfm/models/console/components/data/entity/default"
        sling:resourceSuperType="dam/cfm/models/console/components/data/entity"
        cq:scaffolding="${CONF}/settings/dam/cfm/models/${modelName}/jcr:content/model"
        cq:templateType="/libs/settings/dam/cfm/model-types/fragment"
        status="enabled">
        <model jcr:primaryType="cq:PageContent"
            sling:resourceType="wcm/scaffolding/components/scaffolding"
            dataTypesConfig="/mnt/overlay/settings/dam/cfm/models/formbuilderconfig/datatypes"
            cq:targetPath="/content/dam/nyu-gallatin-eds"
            maxGeneratedOrder="20">
            <cq:dialog jcr:primaryType="nt:unstructured" sling:resourceType="cq/gui/components/authoring/dialog">
                <content jcr:primaryType="nt:unstructured" sling:resourceType="granite/ui/components/coral/foundation/fixedcolumns">
                    <items jcr:primaryType="nt:unstructured" maxGeneratedOrder="20">
${fieldsXml}
                    </items>
                </content>
            </cq:dialog>
        </model>
    </jcr:content>
</jcr:root>
`;
}

// ---- faculty-profile (13 fields) ----
order = 0;
const facultyFields = [
  textSingle('name', 'name', 'Name', { required: true }),
  textSingle('role', 'role', 'Title / Role'),
  textSingle('department', 'department', 'Department / School'),
  imageRef('photo', 'photo', 'Photo'),
  textSingle('email', 'email', 'Email'),
  textSingle('pronouns', 'pronouns', 'Pronouns'),
  textSingle('profileUrl', 'profileUrl', 'Profile URL'),
  textMulti('shortBio', 'shortBio', 'Short Bio'),
  richText('bio', 'bio', 'Biography'),
  multiValue('education', 'education', 'Education'),
  multiValue('researchInterests', 'researchInterests', 'Research Interests'),
  richText('publications', 'publications', 'Publications'),
  richText('awards', 'awards', 'Awards & Honors'),
].join('\n');
const facultyXml = model('faculty-profile', 'Faculty Profile',
  'NYU Gallatin faculty profile: identity, contact, biography, education, research interests, publications, and honors.',
  facultyFields);

// ---- lecturer (4 fields) ----
order = 0;
const lecturerFields = [
  textSingle('name', 'name', 'Name', { required: true }),
  textSingle('title', 'title', 'Title'),
  imageRef('photo', 'photo', 'Photo'),
  richText('bio', 'bio', 'Biography'),
].join('\n');
const lecturerXml = model('lecturer', 'Lecturer',
  'Faculty lecturer profile: name, title, photo, and biography.',
  lecturerFields);

const targets = [
  'jcr_root',
  'tools/importer/package/nyu-gallatin-homepage/jcr_root',
];
for (const base of targets) {
  fs.mkdirSync(`${base}/conf/nyu-gallatin-eds/settings/dam/cfm/models/faculty-profile`, { recursive: true });
  fs.mkdirSync(`${base}/conf/nyu-gallatin-eds/settings/dam/cfm/models/lecturer`, { recursive: true });
  fs.writeFileSync(`${base}/conf/nyu-gallatin-eds/settings/dam/cfm/models/faculty-profile/.content.xml`, facultyXml);
  fs.writeFileSync(`${base}/conf/nyu-gallatin-eds/settings/dam/cfm/models/lecturer/.content.xml`, lecturerXml);
}
console.log('faculty-profile bytes:', facultyXml.length, '| lecturer bytes:', lecturerXml.length);
