import { assertEquals } from "https://deno.land/std/testing/asserts.ts"
import { FileIPC } from "../../lib/core/ipc.ts"
import { fileExists } from "../../lib/common/utils.ts"

const TEST_FILE_PATH = "./test_data_FileIPC.ipctest"
const TEST_STALE_LIMIT = 2000

Deno.test({
  name: "FileIPC sendData writes data to file",
  async fn() {
    const fileIPC = new FileIPC(TEST_FILE_PATH)
    await fileIPC.sendData("test data")
    const fileExistsResult = await fileExists(TEST_FILE_PATH)
    assertEquals(fileExistsResult, true)
    await fileIPC.close()
  },
})

Deno.test({
  name: "FileIPC receiveData returns an array of ValidatedMessages",
  async fn() {
    const fileIPC = new FileIPC(TEST_FILE_PATH)
    await fileIPC.sendData("test data")
    const receivedMessages = await fileIPC.receiveData()
    assertEquals(receivedMessages.length, 1)
    assertEquals(receivedMessages[0].pid, Deno.pid)
    assertEquals(receivedMessages[0].data, "test data")
    assertEquals(receivedMessages[0].errors.length, 0)
    //assertEquals(receivedMessages[0].sent, expectedMessage.sent)
    await fileIPC.close()
  },
})

Deno.test({
  name: "FileIPC receiveData removes stale messages",
  async fn() {
    const fileIPC = new FileIPC(TEST_FILE_PATH, TEST_STALE_LIMIT)
    await fileIPC.sendData("test data 1")
    await new Promise((resolve) => setTimeout(resolve, TEST_STALE_LIMIT + 100))
    await fileIPC.sendData("test data 2")
    const receivedMessages = await fileIPC.receiveData()
    console.log(receivedMessages)
    assertEquals(receivedMessages.length, 2)
    assertEquals(receivedMessages[0].pid, Deno.pid)
    assertEquals(receivedMessages[0].data, null)
    assertEquals(receivedMessages[0].errors.length, 1)
    assertEquals(receivedMessages[0].errors[0], "Invalid data received: stale")
    assertEquals(receivedMessages[1].pid, Deno.pid)
    assertEquals(receivedMessages[1].data, "test data 2")
    assertEquals(receivedMessages[1].errors.length, 0)
    await fileIPC.close()
  },
})

Deno.test({
  name: "FileIPC receiveData handles invalid messages",
  async fn() {
    const fileIPC = new FileIPC(TEST_FILE_PATH)
    await fileIPC.sendData("test data")
    await fileIPC.sendData("a".repeat(fileIPC.MAX_DATA_LENGTH + 1))
    const receivedMessages = await fileIPC.receiveData()
    assertEquals(receivedMessages.length, 2)
    assertEquals(receivedMessages[0].pid, Deno.pid)
    assertEquals(receivedMessages[0].data, "test data")
    assertEquals(receivedMessages[0].errors.length, 0)
    assertEquals(receivedMessages[1].pid, Deno.pid)
    assertEquals(receivedMessages[1].data, null)
    assertEquals(receivedMessages[1].errors.length, 1)
    assertEquals(receivedMessages[1].errors, ["Invalid data received: too long"])
    await fileIPC.close()
  },
})

Deno.test({
  name: "FileIPC close removes IPC file",
  async fn() {
    const fileIPC = new FileIPC(TEST_FILE_PATH)
    await fileIPC.sendData("test data")
    await fileIPC.close()
    const fileExistsResult = await fileExists(TEST_FILE_PATH)
    assertEquals(fileExistsResult, false)
  },
})
