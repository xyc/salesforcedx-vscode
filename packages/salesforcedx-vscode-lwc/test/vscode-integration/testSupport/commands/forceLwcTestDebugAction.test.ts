/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { expect } from 'chai';
import * as path from 'path';
import { assert, SinonStub, stub } from 'sinon';
import * as uuid from 'uuid';
import * as vscode from 'vscode';
import Uri from 'vscode-uri';
import {
  FORCE_LWC_TEST_DEBUG_LOG_NAME,
  forceLwcTestCaseDebug,
  getDebugConfiguration,
  handleDidStartDebugSession,
  handleDidTerminateDebugSession
} from '../../../../src/testSupport/commands/forceLwcTestDebugAction';
import * as lwcTestRunner from '../../../../src/testSupport/testRunner';
import { TestType } from '../../../../src/testSupport/types';
const sfdxCoreExports = vscode.extensions.getExtension(
  'salesforce.salesforcedx-vscode-core'
)!.exports;
const telemetryService = sfdxCoreExports.telemetryService;

describe('Force LWC Test Debug - Code Action', () => {
  let uuidStub: SinonStub;
  let debugStub: SinonStub;
  let lwcTestRunnerStub: SinonStub;
  let processHrtimeStub: SinonStub;
  let telemetryStub: SinonStub;
  const mockUuid = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  beforeEach(() => {
    uuidStub = stub(uuid, 'v4');
    debugStub = stub(vscode.debug, 'startDebugging');
    processHrtimeStub = stub(process, 'hrtime');
    telemetryStub = stub(telemetryService, 'sendCommandEvent');
    lwcTestRunnerStub = stub(lwcTestRunner, 'getLwcTestRunnerExecutable');
    uuidStub.returns(mockUuid);
    debugStub.returns(Promise.resolve());
  });

  afterEach(() => {
    uuidStub.restore();
    debugStub.restore();
    processHrtimeStub.restore();
    telemetryStub.restore();
    lwcTestRunnerStub.restore();
  });

  const root = /^win32/.test(process.platform) ? 'C:\\' : '/var';
  const sfdxProjectPath = path.join(root, 'project', 'mockSfdxProject');
  const lwcTestExecutablePath = path.join(
    sfdxProjectPath,
    'node_modules',
    '.bin',
    'lwc-jest'
  );
  const testRelativePath = path.join(
    'force-app',
    'main',
    'default',
    'lwc',
    'mockComponent',
    '__tests__',
    'mockTest.test.js'
  );
  const testFsPath = path.join(sfdxProjectPath, testRelativePath);
  const testName = 'mockTestName';

  describe('Debug Configuration', () => {
    it('Should generate debug configuration for single test case', () => {
      const debugConfiguration = getDebugConfiguration(
        lwcTestExecutablePath,
        sfdxProjectPath,
        testFsPath,
        testName
      );
      expect(debugConfiguration).to.deep.equal({
        sfdxDebugSessionId: mockUuid,
        type: 'node',
        request: 'launch',
        name: 'Debug LWC test(s)',
        cwd: sfdxProjectPath,
        runtimeExecutable: lwcTestExecutablePath,
        args: [
          '--debug',
          '--',
          '--runTestsByPath',
          /^win32/.test(process.platform) ? testRelativePath : testFsPath,
          '--testNamePattern',
          '"mockTestName"'
        ],
        console: 'integratedTerminal',
        internalConsoleOptions: 'openOnSessionStart',
        port: 9229,
        disableOptimisticBPs: true
      });
    });
  });

  describe('Debug Test Case', () => {
    it('Should send telemetry for debug test case', async () => {
      lwcTestRunnerStub.returns(lwcTestExecutablePath);
      const mockHrtime = [123, 456];
      processHrtimeStub.returns([123, 456]);
      const debugConfiguration = getDebugConfiguration(
        lwcTestExecutablePath,
        sfdxProjectPath,
        testFsPath,
        testName
      );
      const testUri = Uri.file(testFsPath);
      const testExecutionInfo = {
        testType: TestType.LWC,
        testName,
        testUri
      };
      await forceLwcTestCaseDebug({
        testExecutionInfo
      });
      const mockDebugSession = {
        id: 'mockId',
        type: 'node',
        name: debugConfiguration.name,
        workspaceFolder: debugConfiguration.cwd,
        configuration: debugConfiguration,
        customRequest: (command: string) => Promise.resolve()
      };
      handleDidStartDebugSession(mockDebugSession);
      handleDidTerminateDebugSession(mockDebugSession);
      assert.calledOnce(telemetryStub);
      assert.calledWith(
        telemetryStub,
        FORCE_LWC_TEST_DEBUG_LOG_NAME,
        mockHrtime
      );
    });
  });
});
