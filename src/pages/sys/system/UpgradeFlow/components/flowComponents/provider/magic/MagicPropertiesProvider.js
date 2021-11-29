import inherits from 'inherits';

import PropertiesActivator from 'bpmn-js-properties-panel/lib/PropertiesActivator';

import asyncCapableHelper from 'bpmn-js-properties-panel/lib/helper/AsyncCapableHelper';
import ImplementationTypeHelper from 'bpmn-js-properties-panel/lib/helper/ImplementationTypeHelper';

// bpmn properties
import processProps from 'bpmn-js-properties-panel/lib/provider/bpmn/parts/ProcessProps';
import eventProps from 'bpmn-js-properties-panel/lib/provider/bpmn/parts/EventProps';
import linkProps from 'bpmn-js-properties-panel/lib/provider/bpmn/parts/LinkProps';
import documentationProps from 'bpmn-js-properties-panel/lib/provider/bpmn/parts/DocumentationProps';
import idProps from 'bpmn-js-properties-panel/lib/provider/bpmn/parts/IdProps';
// import nameProps from 'bpmn-js-properties-panel/lib/provider/bpmn/parts/NameProps';
import executableProps from 'bpmn-js-properties-panel/lib/provider/bpmn/parts/ExecutableProps';

// camunda properties
import serviceTaskDelegateProps from 'bpmn-js-properties-panel/lib/provider/camunda/parts/ServiceTaskDelegateProps';
import userTaskProps from 'bpmn-js-properties-panel/lib/provider/camunda/parts/UserTaskProps';
import asynchronousContinuationProps from 'bpmn-js-properties-panel/lib/provider/camunda/parts/AsynchronousContinuationProps';
import callActivityProps from 'bpmn-js-properties-panel/lib/provider/camunda/parts/CallActivityProps';
import multiInstanceProps from 'bpmn-js-properties-panel/lib/provider/camunda/parts/MultiInstanceLoopProps';
import conditionalProps from 'bpmn-js-properties-panel/lib/provider/camunda/parts/ConditionalProps';
import scriptProps from 'bpmn-js-properties-panel/lib/provider/camunda/parts/ScriptTaskProps';
import errorProps from 'bpmn-js-properties-panel/lib/provider/camunda/parts/ErrorEventProps';
import formProps from 'bpmn-js-properties-panel/lib/provider/camunda/parts/FormProps';
import startEventInitiator from 'bpmn-js-properties-panel/lib/provider/camunda/parts/StartEventInitiator';
import variableMapping from 'bpmn-js-properties-panel/lib/provider/camunda/parts/VariableMappingProps';
import versionTag from 'bpmn-js-properties-panel/lib/provider/camunda/parts/VersionTagProps';

import listenerProps from 'bpmn-js-properties-panel/lib/provider/camunda/parts/ListenerProps';
import listenerDetails from 'bpmn-js-properties-panel/lib/provider/camunda/parts/ListenerDetailProps';
import listenerFields from 'bpmn-js-properties-panel/lib/provider/camunda/parts/ListenerFieldInjectionProps';

import elementTemplateChooserProps from 'bpmn-js-properties-panel/lib/provider/camunda/element-templates/parts/ChooserProps';
import elementTemplateCustomProps from 'bpmn-js-properties-panel/lib/provider/camunda/element-templates/parts/CustomProps';

// Input/Output
import inputOutput from 'bpmn-js-properties-panel/lib/provider/camunda/parts/InputOutputProps';
import inputOutputParameter from 'bpmn-js-properties-panel/lib/provider/camunda/parts/InputOutputParameterProps';

// Connector
import connectorDetails from 'bpmn-js-properties-panel/lib/provider/camunda/parts/ConnectorDetailProps';
import connectorInputOutput from 'bpmn-js-properties-panel/lib/provider/camunda/parts/ConnectorInputOutputProps';
import connectorInputOutputParameter from 'bpmn-js-properties-panel/lib/provider/camunda/parts/ConnectorInputOutputParameterProps';

// properties
import properties from 'bpmn-js-properties-panel/lib/provider/camunda/parts/PropertiesProps';

// job configuration
import jobConfiguration from 'bpmn-js-properties-panel/lib/provider/camunda/parts/JobConfigurationProps';

// history time to live
import historyTimeToLive from 'bpmn-js-properties-panel/lib/provider/camunda/parts/HistoryTimeToLiveProps';

// candidate starter groups/users
import candidateStarter from 'bpmn-js-properties-panel/lib/provider/camunda/parts/CandidateStarterProps';

// tasklist
import tasklist from 'bpmn-js-properties-panel/lib/provider/camunda/parts/TasklistProps';

// external task configuration
import externalTaskConfiguration from 'bpmn-js-properties-panel/lib/provider/camunda/parts/ExternalTaskConfigurationProps';

// field injection
import fieldInjections from 'bpmn-js-properties-panel/lib/provider/camunda/parts/FieldInjectionProps';

import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';
import eventDefinitionHelper from 'bpmn-js-properties-panel/lib/helper/EventDefinitionHelper';

// helpers ////////////////////////////////////////

// more tab more properties
import approver from './parts/Approver';
import nameProps from './parts/NameProps';
import lineInfo from './parts/LineInfo';

let dispatchFn = '';

function getDispath(dis) {
  dispatchFn = dis;
}

let xmlValue = '';

function setValueToXml(val) {
  xmlValue = val;
}

let flowIsCreate = true;

function flowIsCreateFn(val) {
  flowIsCreate = val;
}

let getFlowNameCallback = '';

function nameChange(callback) {
  getFlowNameCallback = callback;
}

const isExternalTaskPriorityEnabled = element => {
  const businessObject = getBusinessObject(element);

  // show only if element is a process, a participant ...
  if (
    is(element, 'bpmn:Process') ||
    (is(element, 'bpmn:Participant') && businessObject.get('processRef'))
  ) {
    return true;
  }

  const externalBo = ImplementationTypeHelper.getServiceTaskLikeBusinessObject(element);
  const isExternalTask = ImplementationTypeHelper.getImplementationType(externalBo) === 'external';

  // ... or an external task with selected external implementation type
  return !!ImplementationTypeHelper.isExternalCapable(externalBo) && isExternalTask;
};

const isJobConfigEnabled = element => {
  const businessObject = getBusinessObject(element);

  if (
    is(element, 'bpmn:Process') ||
    (is(element, 'bpmn:Participant') && businessObject.get('processRef'))
  ) {
    return true;
  }

  // async behavior
  const bo = getBusinessObject(element);
  if (asyncCapableHelper.isAsyncBefore(bo) || asyncCapableHelper.isAsyncAfter(bo)) {
    return true;
  }

  // timer definition
  if (is(element, 'bpmn:Event')) {
    return !!eventDefinitionHelper.getTimerEventDefinition(element);
  }

  return false;
};

const getInputOutputParameterLabel = (param, translate) => {
  if (is(param, 'camunda:InputParameter')) {
    return translate('Input Parameter');
  }

  if (is(param, 'camunda:OutputParameter')) {
    return translate('Output Parameter');
  }

  return '';
};

const getListenerLabel = (param, translate) => {
  if (is(param, 'camunda:ExecutionListener')) {
    return translate('Execution Listener');
  }

  if (is(param, 'camunda:TaskListener')) {
    return translate('Task Listener');
  }

  return '';
};

const PROCESS_KEY_HINT = 'This maps to the process definition key.';
const TASK_KEY_HINT = 'This maps to the task definition key.';

function createGeneralTabGroups(
  ele,
  canvas,
  bpmnFactory,
  elementRegistry,
  elementTemplates,
  translate
) {
  // refer to target element for external labels
  const element = ele.labelTarget || ele;

  const generalGroup = {
    id: 'general',
    label: translate('General'),
    entries: [],
  };

  let idOptions;
  let processOptions;

  if (is(element, 'bpmn:Process')) {
    idOptions = { description: PROCESS_KEY_HINT };
  }

  if (is(element, 'bpmn:UserTask')) {
    idOptions = { description: TASK_KEY_HINT };
  }

  if (is(element, 'bpmn:Participant')) {
    processOptions = { processIdDescription: PROCESS_KEY_HINT };
  }

  idProps(generalGroup, element, translate, idOptions);
  nameProps(generalGroup, element, bpmnFactory, canvas, translate, getFlowNameCallback);
  processProps(generalGroup, element, translate, processOptions);
  versionTag(generalGroup, element, translate);
  executableProps(generalGroup, element, translate);
  elementTemplateChooserProps(generalGroup, element, elementTemplates, translate);

  const customFieldsGroups = elementTemplateCustomProps(
    element,
    elementTemplates,
    bpmnFactory,
    translate
  );

  const detailsGroup = {
    id: 'details',
    label: translate('Details'),
    entries: [],
  };
  serviceTaskDelegateProps(detailsGroup, element, bpmnFactory, translate);
  userTaskProps(detailsGroup, element, translate);
  scriptProps(detailsGroup, element, bpmnFactory, translate);
  linkProps(detailsGroup, element, translate);
  callActivityProps(detailsGroup, element, bpmnFactory, translate);
  eventProps(detailsGroup, element, bpmnFactory, elementRegistry, translate);
  errorProps(detailsGroup, element, bpmnFactory, translate);
  conditionalProps(detailsGroup, element, bpmnFactory, translate);
  startEventInitiator(detailsGroup, element, translate); // this must be the last element of the details group!

  const multiInstanceGroup = {
    id: 'multiInstance',
    label: translate('Multi Instance'),
    entries: [],
  };
  multiInstanceProps(multiInstanceGroup, element, bpmnFactory, translate);

  const asyncGroup = {
    id: 'async',
    label: translate('Asynchronous Continuations'),
    entries: [],
  };
  asynchronousContinuationProps(asyncGroup, element, bpmnFactory, translate);

  const jobConfigurationGroup = {
    id: 'jobConfiguration',
    label: translate('Job Configuration'),
    entries: [],
    enabled: isJobConfigEnabled,
  };
  jobConfiguration(jobConfigurationGroup, element, bpmnFactory, translate);

  const externalTaskGroup = {
    id: 'externalTaskConfiguration',
    label: translate('External Task Configuration'),
    entries: [],
    enabled: isExternalTaskPriorityEnabled,
  };
  externalTaskConfiguration(externalTaskGroup, element, bpmnFactory, translate);

  const candidateStarterGroup = {
    id: 'candidateStarterConfiguration',
    label: translate('Candidate Starter Configuration'),
    entries: [],
  };
  candidateStarter(candidateStarterGroup, element, bpmnFactory, translate);

  const historyTimeToLiveGroup = {
    id: 'historyConfiguration',
    label: translate('History Configuration'),
    entries: [],
  };
  historyTimeToLive(historyTimeToLiveGroup, element, bpmnFactory, translate);

  const tasklistGroup = {
    id: 'tasklist',
    label: translate('Tasklist Configuration'),
    entries: [],
  };
  tasklist(tasklistGroup, element, bpmnFactory, translate);

  const documentationGroup = {
    id: 'documentation',
    label: translate('Documentation'),
    entries: [],
  };
  documentationProps(documentationGroup, element, bpmnFactory, translate);

  const groups = [];
  groups.push(generalGroup);
  customFieldsGroups.forEach(group => {
    groups.push(group);
  });
  groups.push(detailsGroup);
  groups.push(externalTaskGroup);
  groups.push(multiInstanceGroup);
  groups.push(asyncGroup);
  groups.push(jobConfigurationGroup);
  groups.push(candidateStarterGroup);
  groups.push(historyTimeToLiveGroup);
  groups.push(tasklistGroup);
  groups.push(documentationGroup);

  return groups;
}

function createTeleworkTabGroups(
  ele,
  canvas,
  bpmnFactory,
  elementRegistry,
  elementTemplates,
  translate,
  commandStack
) {
  // refer to target element for external labels
  const element = ele.labelTarget || ele;

  const teleworkGroup = {
    id: 'approver',
    label: translate('Telework专用配置'),
    entries: [],
  };

  let idOptions;
  let processOptions;

  if (is(element, 'bpmn:Process')) {
    idOptions = { description: PROCESS_KEY_HINT };
  }

  if (is(element, 'bpmn:UserTask')) {
    idOptions = { description: TASK_KEY_HINT };
  }

  approver(
    teleworkGroup,
    element,
    translate,
    idOptions,
    dispatchFn,
    xmlValue,
    bpmnFactory,
    commandStack
  );

  const groups = [];
  groups.push(teleworkGroup);

  return groups;
}

function createVariableTableTabGroups(
  ele,
  canvas,
  bpmnFactory,
  elementRegistry,
  elementTemplates,
  translate,
  commandStack
) {
  // refer to target element for external labels
  const element = ele.labelTarget || ele;

  const variableTableGroup = {
    id: 'lineInfo',
    label: translate(''),
    entries: [],
  };

  let idOptions;
  let processOptions;

  if (is(element, 'bpmn:Process')) {
    idOptions = { description: PROCESS_KEY_HINT };
  }

  if (is(element, 'bpmn:UserTask')) {
    idOptions = { description: TASK_KEY_HINT };
  }

  lineInfo(
    variableTableGroup,
    element,
    translate,
    idOptions,
    dispatchFn,
    xmlValue,
    bpmnFactory,
    commandStack
  );

  const groups = [];
  groups.push(variableTableGroup);

  return groups;
}

function createVariablesTabGroups(element, bpmnFactory, elementRegistry, translate) {
  const variablesGroup = {
    id: 'variables',
    label: translate('Variables'),
    entries: [],
  };
  variableMapping(variablesGroup, element, bpmnFactory, translate);

  return [variablesGroup];
}

function createFormsTabGroups(element, bpmnFactory, elementRegistry, translate) {
  const formGroup = {
    id: 'forms',
    label: translate('Forms'),
    entries: [],
  };
  formProps(formGroup, element, bpmnFactory, translate);

  return [formGroup];
}

function createListenersTabGroups(element, bpmnFactory, elementRegistry, translate) {
  const listenersGroup = {
    id: 'listeners',
    label: translate('Listeners'),
    entries: [],
  };

  const options = listenerProps(listenersGroup, element, bpmnFactory, translate);

  const listenerDetailsGroup = {
    id: 'listener-details',
    entries: [],
    enabled: (ele, node) => options.getSelectedListener(ele, node),
    label: (ele, node) => {
      const param = options.getSelectedListener(ele, node);
      return getListenerLabel(param, translate);
    },
  };

  listenerDetails(listenerDetailsGroup, element, bpmnFactory, options, translate);

  const listenerFieldsGroup = {
    id: 'listener-fields',
    label: translate('Field Injection'),
    entries: [],
    enabled: (ele, node) => options.getSelectedListener(ele, node),
  };

  listenerFields(listenerFieldsGroup, element, bpmnFactory, options, translate);

  return [listenersGroup, listenerDetailsGroup, listenerFieldsGroup];
}

function createInputOutputTabGroups(element, bpmnFactory, elementRegistry, translate) {
  const inputOutputGroup = {
    id: 'input-output',
    label: translate('Parameters'),
    entries: [],
  };

  const options = inputOutput(inputOutputGroup, element, bpmnFactory, translate);

  const inputOutputParameterGroup = {
    id: 'input-output-parameter',
    entries: [],
    enabled: (ele, node) => options.getSelectedParameter(ele, node),
    label: (ele, node) => {
      const param = options.getSelectedParameter(ele, node);
      return getInputOutputParameterLabel(param, translate);
    },
  };

  inputOutputParameter(inputOutputParameterGroup, element, bpmnFactory, options, translate);

  return [inputOutputGroup, inputOutputParameterGroup];
}

function createConnectorTabGroups(element, bpmnFactory, elementRegistry, translate) {
  const connectorDetailsGroup = {
    id: 'connector-details',
    label: translate('Details'),
    entries: [],
  };

  connectorDetails(connectorDetailsGroup, element, bpmnFactory, translate);

  const connectorInputOutputGroup = {
    id: 'connector-input-output',
    label: translate('Input/Output'),
    entries: [],
  };

  const options = connectorInputOutput(connectorInputOutputGroup, element, bpmnFactory, translate);

  const connectorInputOutputParameterGroup = {
    id: 'connector-input-output-parameter',
    entries: [],
    enabled: (ele, node) => options.getSelectedParameter(ele, node),
    label: (ele, node) => {
      const param = options.getSelectedParameter(ele, node);
      return getInputOutputParameterLabel(param, translate);
    },
  };

  connectorInputOutputParameter(
    connectorInputOutputParameterGroup,
    element,
    bpmnFactory,
    options,
    translate
  );

  return [connectorDetailsGroup, connectorInputOutputGroup, connectorInputOutputParameterGroup];
}

function createFieldInjectionsTabGroups(element, bpmnFactory, elementRegistry, translate) {
  const fieldGroup = {
    id: 'field-injections-properties',
    label: translate('Field Injections'),
    entries: [],
  };

  fieldInjections(fieldGroup, element, bpmnFactory, translate);

  return [fieldGroup];
}

function createExtensionElementsGroups(element, bpmnFactory, elementRegistry, translate) {
  const propertiesGroup = {
    id: 'extensionElements-properties',
    label: translate('Properties'),
    entries: [],
  };
  properties(propertiesGroup, element, bpmnFactory, translate);

  return [propertiesGroup];
}

// Camunda Properties Provider /////////////////////////////////////

/**
 * A properties provider for Camunda related properties.
 *
 * @param {EventBus} eventBus
 * @param {Canvas} canvas
 * @param {BpmnFactory} bpmnFactory
 * @param {ElementRegistry} elementRegistry
 * @param {ElementTemplates} elementTemplates
 * @param {Translate} translate
 */
function CamundaPropertiesProvider(
  eventBus,
  canvas,
  bpmnFactory,
  elementRegistry,
  elementTemplates,
  translate,
  commandStack
) {
  PropertiesActivator.call(this, eventBus);

  this.getTabs = element => {
    const generalTab = {
      id: 'general',
      label: translate('General'),
      groups: createGeneralTabGroups(
        element,
        canvas,
        bpmnFactory,
        elementRegistry,
        elementTemplates,
        translate
      ),
    };

    const variablesTab = {
      id: 'variables',
      label: translate('Variables'),
      groups: createVariablesTabGroups(element, bpmnFactory, elementRegistry, translate),
    };

    const formsTab = {
      id: 'forms',
      label: translate('Forms'),
      groups: createFormsTabGroups(element, bpmnFactory, elementRegistry, translate),
    };

    const listenersTab = {
      id: 'listeners',
      label: translate('Listeners'),
      groups: createListenersTabGroups(element, bpmnFactory, elementRegistry, translate),
      enabled: ele =>
        !eventDefinitionHelper.getLinkEventDefinition(ele) ||
        (!is(ele, 'bpmn:IntermediateThrowEvent') &&
          eventDefinitionHelper.getLinkEventDefinition(ele)),
    };

    const inputOutputTab = {
      id: 'input-output',
      label: translate('Input/Output'),
      groups: createInputOutputTabGroups(element, bpmnFactory, elementRegistry, translate),
    };

    const connectorTab = {
      id: 'connector',
      label: translate('Connector'),
      groups: createConnectorTabGroups(element, bpmnFactory, elementRegistry, translate),
      enabled: ele => {
        const bo = ImplementationTypeHelper.getServiceTaskLikeBusinessObject(ele);
        return bo && ImplementationTypeHelper.getImplementationType(bo) === 'connector';
      },
    };

    const fieldInjectionsTab = {
      id: 'field-injections',
      label: translate('Field Injections'),
      groups: createFieldInjectionsTabGroups(element, bpmnFactory, elementRegistry, translate),
    };

    const extensionsTab = {
      id: 'extensionElements',
      label: translate('Extensions'),
      groups: createExtensionElementsGroups(element, bpmnFactory, elementRegistry, translate),
    };

    const teleworkTab = {
      id: 'telework',
      label: translate('Telework'),
      groups: createTeleworkTabGroups(
        element,
        canvas,
        bpmnFactory,
        elementRegistry,
        elementTemplates,
        translate,
        commandStack
      ),
    };
    if (flowIsCreate) {
      return [
        generalTab,
        variablesTab,
        connectorTab,
        formsTab,
        listenersTab,
        inputOutputTab,
        fieldInjectionsTab,
        extensionsTab,
      ];
    }
    const variableTableTab = {
      id: 'variableTable',
      label: translate('VariableTable'),
      groups: createVariableTableTabGroups(
        element,
        canvas,
        bpmnFactory,
        elementRegistry,
        elementTemplates,
        translate,
        commandStack
      ),
    };
    if (flowIsCreate) {
      return [
        generalTab,
        variablesTab,
        connectorTab,
        formsTab,
        listenersTab,
        inputOutputTab,
        fieldInjectionsTab,
        extensionsTab,
      ];
    }

    return [
      generalTab,
      teleworkTab,
      variableTableTab,
      variablesTab,
      connectorTab,
      formsTab,
      listenersTab,
      inputOutputTab,
      fieldInjectionsTab,
      extensionsTab,
    ];
  };
}

CamundaPropertiesProvider.$inject = [
  'eventBus',
  'canvas',
  'bpmnFactory',
  'elementRegistry',
  'elementTemplates',
  'translate',
  'commandStack',
];

inherits(CamundaPropertiesProvider, PropertiesActivator);

module.exports = {
  CamundaPropertiesProvider,
  getDispath,
  setValueToXml,
  flowIsCreateFn,
  nameChange,
};
