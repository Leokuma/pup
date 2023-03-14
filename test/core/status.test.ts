//import { Application } from "../../application.meta.ts"
import { Process, ProcessInformation, ProcessStatus } from "../../lib/core/process.ts"
import { Pup } from "../../lib/core/pup.ts"
import { Status } from "../../lib/core/status.ts"
import { assertEquals, spy } from "../deps.ts"

class MockProcess extends Process {
  constructor() {
    const pup = new Pup({ processes: [{ id: "task-1", cmd: ["deno", "run", "test"] }] })
    super(pup, { id: "task-1", cmd: ["deno", "run", "test"] })
  }
  public getStatus(): ProcessInformation {
    return {
      id: super.getConfig().id,
      status: ProcessStatus.RUNNING,
      pid: 123,
      code: undefined,
      signal: undefined,
      started: new Date(),
      exited: undefined,
      blocked: false,
      restarts: 1,
      updated: new Date(),
    }
  }
}

Deno.test("Status should create an instance with statusFileName property if provided", () => {
  const expectedFileName = "status.json"
  const status = new Status(expectedFileName)
  assertEquals(status["statusFileName"], expectedFileName)
})

Deno.test("Status should not have statusFileName property if not provided", () => {
  const status = new Status()
  assertEquals(status["statusFileName"], undefined)
})

Deno.test("Status.writeToDisk should write the status to disk if statusFileName property is set", () => {
  /*const expectedFileName = "status.json"
  const expectedProcess = new MockProcess()
  const expectedProcessStatus = expectedProcess.getStatus()
  const expectedPupStatus = {
    pid: Deno.pid,
    version: Application.version,
    updated: new Date().toISOString(),
    processes: [expectedProcessStatus],
  }
  const writeFileSpy = spy(Deno, "writeFile")

  const status = new Status(expectedFileName)
  status.writeToDisk([expectedProcess])

  //const decoder = new TextDecoder();
  //const actualPupStatus = JSON.parse(deoder.decode(new Uint8Array().fro(writeFileSpy.calls[0].args[1])));

  //assertEquals(writeFileSpy.calls.length, 1);
  //assertEquals(writeFileSpy.calls[0].args[0], expectedFileName);
  //assertEquals(expectedPupStatus, actualPupStatus);

  writeFileSpy.restore()*/
})

Deno.test("Status.writeToDisk should not write the status to disk if statusFileName property is not set", () => {
  const writeFileSpy = spy(Deno, "writeFile")

  const status = new Status()
  status.writeToDisk([])

  assertEquals(writeFileSpy.calls.length, 0)

  writeFileSpy.restore()
})

Deno.test("Status.writeToDisk should catch and log errors", async () => {
  const expectedProcess = new MockProcess()
  const consoleErrorSpy = spy(console, "error")
  const writeFileSpy = spy(Deno, "writeFile")

  const status = new Status("status.json")
  await status.writeToDisk([expectedProcess])

  assertEquals(writeFileSpy.calls.length, 1)
  assertEquals(consoleErrorSpy.calls.length, 1)
  assertEquals(consoleErrorSpy.calls[0].args[0], "Error while writing status to disk.")

  writeFileSpy.restore()
  consoleErrorSpy.restore()
})
