// Load in dependencies
var childProcess = require('child_process');
var path = require('path');
var expect = require('chai').expect;
// TODO: Move to enclosed file system with no fear of publishing anything
// TODO: How will this behave with gitter calls? Should we move off of git CLI? They might have customizations.
var sinon = require('sinon');
var wrench = require('wrench');
var Foundry = require('../bin/foundry');

// Stop exec calls from happening
// TODO: This will become mock
var shell = require('shelljs');
shell.exec = function () {
  throw new Error('`shell.exec` was being called with ' + JSON.stringify(arguments));
};

// DEV: NEVER EVER RUN FOUNDRY VIA .exec
// DEV: WE CANNOT STOP .exec CALLS FROM OCCURRING IN ANOTHER PROCESS
// TODO: Strongly consider running tests within a Vagrant to prevent publication since nothing is configured

var tmp = shell.tempdir();
var fixtureDir = path.join(tmp, 'foundry_test');
before(function deleteFixtureDir (done) {
  wrench.rmdirRecursive(fixtureDir, false, function (err) {
    done();
  });
});
before(function createFixtureDir () {
  // DEV: There is no asynchronous flavor. We could use mkdirp but this is fine.
  wrench.mkdirSyncRecursive(fixtureDir);
});
before(function goToFixtureDir () {
  process.chdir(fixtureDir);
});

// TODO: Use this... similar to that of sexy-bash-prompt
function fixtureDir(name) {
  before(function copyFixtures (done) {

  });
  // TODO: Perform this
  // before(function moveDotgitToGit (done) {

  // });
}

describe('A release', function () {
  describe('in a git folder', function () {
    before(function createGitFolder () {
      this.gitDir = path.join(fixtureDir, 'git_test');
      wrench.mkdirSyncRecursive(this.gitDir);
    });
    before(function initializeGitFolder (done) {
      var that = this;
      process.chdir(this.gitDir);
      childProcess.exec('git init', function (err, stdout, stderr) {
        that.stdout = stdout;
        done(err);
      });
    });
    before(function stubExec () {
      this.stub = sinon.stub(shell, 'exec', function () {
        return {};
      });
    });
    after(function () {
      this.stub.restore();
    });
    before(function release (done) {
      var program = new Foundry();
      program.parse(['node', '/usr/bin/foundry', 'release', '0.1.0']);
      // TODO: Figure out how to hook in better
      setTimeout(done, 1000);
    });

    it('adds a git tag', function () {
      expect(this.stub.args[0]).to.deep.equal(['git commit -a -m "Release 0.1.0"']);
      expect(this.stub.args[1]).to.deep.equal(['git tag 0.1.0 -a -m "Release 0.1.0"']);
      expect(this.stub.args[2]).to.deep.equal(['git push']);
      expect(this.stub.args[3]).to.deep.equal(['git push --tags']);

      // childProcess.exec('git tag', function (err, stdout, stderr) {
      //   if (err) {
      //     return done(err);
      //   }
      //   expect(stdout).to.equal('0.1.0');
      // });
    });
  });
});
